import { UserRoleEnum } from '@app/enums/user-role';
import { RequestUser } from '@app/interfaces/request.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  // constructor(private readonly userRoleService: UserRoleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    const roles = request.user.roles;
    return roles.includes(UserRoleEnum.SUPERADMIN);
  }
}
