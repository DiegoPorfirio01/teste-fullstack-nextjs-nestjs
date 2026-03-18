import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();

    if (!user || !user.role) {
      throw new UnauthorizedException('Usuário não autorizado');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new UnauthorizedException(
        `Usuário não possui a função necessária: ${requiredRoles.join(', ')} para acessar este recurso`,
      );
    }

    return true;
  }
}
