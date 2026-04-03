import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

interface ValidatedUser {
  id: number;
  username: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    });
    await this.userRepo.save(user);
    return this.login({ id: user.id, username: user.username, mfaEnabled: user.mfaEnabled });
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
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<ValidatedUser | null> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      return { id: user.id, username: user.username, mfaEnabled: user.mfaEnabled, mfaSecret: user.mfaSecret };
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
    return { id: user.id, username: user.username, mfaEnabled: user.mfaEnabled, mfaSecret: user.mfaSecret };
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
}
