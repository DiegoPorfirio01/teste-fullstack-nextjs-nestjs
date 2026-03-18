import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import type { JwtUser } from '../auth/jwt.strategy';
import { IS_PUBLIC_KEY } from './decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = JwtUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException();
    }

    return user;
  }
}
