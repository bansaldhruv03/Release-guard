import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Organization } from '../organization/organization.entity';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { randomBytes } from 'crypto';

interface ValidatedUser {
  id: number;
  username: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  organizationId?: string;
  email?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async registerUser(username: string, pass: string, email: string) {
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) throw new BadRequestException('Username already exists');
    
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      email,
      role: 'user',
      mfaEnabled: false,
      organizationId: "def1024b-abcd-4114-1234-abcd00000001" // Default Org
    });
    await this.userRepo.save(user);
    return this.login({ 
      id: user.id, 
      username: user.username, 
      mfaEnabled: user.mfaEnabled,
      organizationId: user.organizationId,
      email: user.email
    });
  }

  login(user: ValidatedUser, mfaToken?: string): { access_token: string } {
    if (user.mfaEnabled) {
      if (!mfaToken) {
        throw new UnauthorizedException('MFA token required');
      }
      if (!user.mfaSecret) {
        throw new UnauthorizedException('MFA not properly configured');
      }
      const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 1,
      });
      if (!isValid) {
        throw new UnauthorizedException('Invalid MFA token');
      }
    }
    const payload = { username: user.username, sub: user.id, orgId: user.organizationId, email: user.email || '' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(usernameOrEmail: string, pass: string): Promise<ValidatedUser | null> {
    // Allow login with either username or email
    const user = await this.userRepo.findOne({
      where: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    });
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      return { 
        id: user.id, 
        username: user.username, 
        mfaEnabled: user.mfaEnabled, 
        mfaSecret: user.mfaSecret,
        organizationId: user.organizationId,
        email: user.email
      };
    }
    return null;
  }

  async validateApiKey(apiKey: string): Promise<string | null> {
    const org = await this.orgRepo.findOne({ select: ['id', 'apiKey'], where: { apiKey } });
    if (org) {
      // Create a specialized token for the CLI linked to the organization
      const payload = { orgId: org.id, isApiKey: true };
      return this.jwtService.sign(payload);
    }
    return null;
  }

  async validateSocialLogin(provider: string, providerId: string, email: string): Promise<ValidatedUser> {
    const query: any = {};
    if (provider === 'github') query['githubId'] = providerId;
    if (provider === 'gitlab') query['gitlabId'] = providerId;
    if (provider === 'google') query['googleId'] = providerId;
    
    let user = await this.userRepo.findOne({ where: query });
    if (!user) {
      user = this.userRepo.create({
        username: `${provider}_${providerId}`,
        email: email,
        githubId: provider === 'github' ? providerId : undefined,
        gitlabId: provider === 'gitlab' ? providerId : undefined,
        googleId: provider === 'google' ? providerId : undefined,
        role: 'user',
        mfaEnabled: false
      });
      await this.userRepo.save(user);
    }
    return { 
      id: user.id, 
      username: user.username, 
      mfaEnabled: user.mfaEnabled, 
      mfaSecret: user.mfaSecret,
      organizationId: user.organizationId,
      email: user.email
    };
  }

  async generateMfaSecret(userId: number): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Generate a real base32 secret compatible with Google Authenticator
    const secret = speakeasy.generateSecret({
      name: `Release Guard (${user.username})`,
      issuer: 'Release Guard',
      length: 20,
    });

    user.mfaSecret = secret.base32;
    await this.userRepo.save(user);

    // Return QR code as data URI for scanning
    return qrcode.toDataURL(secret.otpauth_url as string);
  }

  async verifyMfaSetup(userId: number, token: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.mfaSecret) return false;

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (isValid) {
      user.mfaEnabled = true;
      await this.userRepo.save(user);
      return true;
    }
    return false;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      // Production Grade: In a real system with an SMTP server, you would
      // generate a secure token, save it to the user record, and email the link.
      // Since no SMTP server is configured, we safely log it locally to prevent enumeration.
      const mockResetToken = randomBytes(32).toString('hex');
      console.log(`\n[SECURITY] Password reset requested for ${email}.`);
      console.log(`[ACTION REQUIRED] Simulated Reset Token: ${mockResetToken}\n`);
    }
    // Always return true to prevent attackers from querying valid emails
    return true;
  }
}
