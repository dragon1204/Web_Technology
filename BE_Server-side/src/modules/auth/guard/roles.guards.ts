
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      console.log("Không có user trong request");
      return false;
    }

    const roleHierarchy = {
      ADMIN : ['ADMIN', 'USER'],
      USER : ['USER']
    }

    const userRoles = roleHierarchy[user.role] || [];

    const isValid = requiredRoles.some(role => userRoles.includes(role));

    return isValid;
  }
}
