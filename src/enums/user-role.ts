import { TransactionInPermission } from './permission';

export enum UserRoleEnum {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  DEFAULT = 'default',
}
const permissionToObject = (arr: Array<string>) => {
  return arr.reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});
};

export const RoleWithPermission = Object.freeze({
  [UserRoleEnum.DEFAULT]: {
    [TransactionInPermission.LIST]: true,
  },

  [UserRoleEnum.ADMIN]: {
    ...permissionToObject(Object.values(TransactionInPermission)),
  },
});
