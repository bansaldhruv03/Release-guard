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
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

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
    private readonly mailService: MailService,
    private readonly config: ConfigService,
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
      // Generate a secure, single-use token with a 1-hour expiry
      const token = randomBytes(32).toString('hex');
      user.resetToken = token;
      user.resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour
      await this.userRepo.save(user);

      const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password.html?token=${token}`;
      await this.mailService.sendPasswordResetEmail(email, resetUrl);
    }
    // Always return true to prevent attackers from enumerating valid emails
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Hash the new password and clear the reset token atomically
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await this.userRepo.save(user);

    return true;
  }
}
