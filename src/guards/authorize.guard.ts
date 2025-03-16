import { RequestUser } from '@app/interfaces/user-request.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    console.log(request.user);
    if (['admin', 'superadmin'].includes(request.user.role)) return false;
  }
}
