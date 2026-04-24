import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub?: number;
  username?: string;
  isApiKey?: boolean;
  orgId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'secret',
    });
  }

  validate(payload: JwtPayload): any {
    if (payload.isApiKey) {
      return { isApiKey: true, orgId: payload.orgId };
    }
    return { userId: payload.sub, username: payload.username, orgId: payload.orgId };
  }
}
