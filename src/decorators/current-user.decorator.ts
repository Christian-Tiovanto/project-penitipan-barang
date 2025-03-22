import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '@app/interfaces/request.interface';
import { JwtPayload } from '@app/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request: RequestUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
