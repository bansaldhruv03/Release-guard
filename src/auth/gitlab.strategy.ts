import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// @ts-ignore
import { Strategy } from 'passport-gitlab2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GitlabStrategy extends PassportStrategy(Strategy, 'gitlab') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITLAB_CLIENT_ID') || 'placeholder_id',
      clientSecret: configService.get<string>('GITLAB_CLIENT_SECRET') || 'placeholder_secret',
      callbackURL: configService.get<string>('GITLAB_CALLBACK_URL') || 'http://localhost:3000/auth/gitlab/callback',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
      const user = await this.authService.validateSocialLogin('gitlab', profile.id, email);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
}
