import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../interfaces/auth-user.interface';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name?: string | null;
  tenantId?: string | null;
  warehouseId?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // C-2 fix: read from ConfigService via getOrThrow, no hardcoded fallback
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    return Promise.resolve({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      tenantId: payload.tenantId,
      warehouseId: payload.warehouseId,
    });
  }
}
