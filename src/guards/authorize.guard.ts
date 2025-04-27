import { UserRoleEnum } from '@app/enums/user-role';
import { RequestUser } from '@app/interfaces/request.interface';
import { mergePermission } from '@app/utils/merge-permission';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    const roles = request.user.roles;

    if (
      roles.includes(UserRoleEnum.SUPERADMIN) ||
      roles.includes(UserRoleEnum.ADMIN)
    ) {
      return true;
    }

    const authorizedPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!authorizedPermissions) {
      return true; // Allow access if no permissions are specified
    }

    // Merge user permissions from user role
    const userPermissions = mergePermission(roles);

    // Check if user has any of the required permissions
    const hasRequiredPermission = authorizedPermissions.some(
      (permission) => userPermissions[permission],
    );

    if (!hasRequiredPermission) {
      throw new UnauthorizedException(
        `Access Denied - Missing Permissions ${authorizedPermissions[0].split('.')[0]}`,
      );
    }
    return true;
  }
}
