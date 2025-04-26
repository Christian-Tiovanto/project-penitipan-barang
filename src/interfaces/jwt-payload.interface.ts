import { UserRoleEnum } from '@app/enums/user-role';
import { User } from '@app/modules/user/models/user';

export type JwtPayload = Pick<User, 'id' | 'fullname'> & {
  roles?: UserRoleEnum[];
};
