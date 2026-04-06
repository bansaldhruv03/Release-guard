import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'missing_github_client_id',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || 'missing_github_secret',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
      const user = await this.authService.validateSocialLogin('github', profile.id, email);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
}
