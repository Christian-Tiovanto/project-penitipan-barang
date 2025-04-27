import { UserRoleEnum } from '@app/enums/user-role';
import { RequestUser } from '@app/interfaces/request.interface';
import { UserRoleService } from '@app/modules/user/services/user-role.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IntermediateGuard implements CanActivate {
  constructor(private readonly userRoleService: UserRoleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    // Get user with its roles corresponding to the tenantId
    const userRoleQuery = this.userRoleService.getUserRoleByUserId(
      request.user.id,
    );
    const userRoles = await userRoleQuery;
    const roles: Array<UserRoleEnum> = userRoles.map(
      (userRole) => userRole.role,
    );

    request.forwardedFrom = 'intermediate';
    request.user.roles = roles;
    return true;
  }
}
