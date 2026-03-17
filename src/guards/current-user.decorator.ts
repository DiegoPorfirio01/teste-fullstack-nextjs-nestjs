import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtUser } from '../auth/jwt.strategy';
import type { UserSession } from '../auth/auth.service';

export type CurrentUserType = JwtUser | UserSession['user'];

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
    return request.user;
  },
);
