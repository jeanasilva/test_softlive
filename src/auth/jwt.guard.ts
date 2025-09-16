import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyJwtHS256 } from './jwt.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'] as string | undefined;
    if (!auth) throw new UnauthorizedException('Missing Authorization header');
    const [scheme, token] = auth.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    const secret = this.configService.get<string>('JWT_SECRET') ?? 'dev-secret-change-me';
    const payload = verifyJwtHS256(token, secret);
    if (!payload) throw new UnauthorizedException('Invalid or expired token');

    request.user = payload;
    return true;
  }
}

