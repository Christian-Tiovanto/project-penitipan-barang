import { RoleWithPermission, UserRoleEnum } from '@app/enums/user-role';

export const mergePermission = (
  roles: UserRoleEnum[],
): Record<string, boolean> => {
  return roles.reduce(
    (acc, role) => Object.assign(acc, RoleWithPermission[role]),
    {},
  );
};
