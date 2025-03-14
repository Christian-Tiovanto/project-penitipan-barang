import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtPayload } from '@app/interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (_, ctx) => ctx.switchToHttp().getRequest<{ user: UserJwtPayload }>().user,
);
