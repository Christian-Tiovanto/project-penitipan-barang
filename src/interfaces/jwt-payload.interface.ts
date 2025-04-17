import { User } from '@app/modules/user/models/user';

export type JwtPayload = Pick<User, 'id' | 'fullname' | 'role'>;
