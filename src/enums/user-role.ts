import {
  ArPaymentPermission,
  CashflowPermission,
  ChargePermission,
  CustomerPaymentPermission,
  CustomerPermission,
  InvoicePermission,
  PaymentMethodPermission,
  ProductPermission,
  ProductUnitPermission,
  ReportPermission,
  SpbPermission,
  TransactionInPermission,
  TransactionOutPermission,
  UserPermission,
} from './permission';

export enum UserRoleEnum {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  DEFAULT = 'default',
  AR_PAYMENT = 'ar_payment',
  CASHFLOW = 'cashflow',
  CHARGE = 'charge',
  CUSTOMER = 'customer',
  CUSTOMER_PAYMENT = 'customer_payment',
  INVOICE = 'invoice',
  PAYMENT_METHOD = 'payment_method',
  PRODUCT = 'product',
  PRODUCT_UNIT = 'product_unit',
  REPORT = 'report',
  SPB = 'spb',
  TRANSACTION_IN = 'transaction_in',
  TRANSACTION_OUT = 'transaction_out',
}
const permissionToObject = (arr: Array<string>) => {
  return arr.reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});
};

export const RoleWithPermission = Object.freeze({
  [UserRoleEnum.AR_PAYMENT]: {
    ...permissionToObject(Object.values(ArPaymentPermission)),
  },
  [UserRoleEnum.CASHFLOW]: {
    ...permissionToObject(Object.values(CashflowPermission)),
  },
  [UserRoleEnum.CHARGE]: {
    ...permissionToObject(Object.values(ChargePermission)),
  },
  [UserRoleEnum.CUSTOMER]: {
    ...permissionToObject(Object.values(CustomerPermission)),
  },
  [UserRoleEnum.CUSTOMER_PAYMENT]: {
    ...permissionToObject(Object.values(CustomerPaymentPermission)),
  },
  [UserRoleEnum.INVOICE]: {
    ...permissionToObject(Object.values(InvoicePermission)),
  },
  [UserRoleEnum.PAYMENT_METHOD]: {
    ...permissionToObject(Object.values(PaymentMethodPermission)),
  },
  [UserRoleEnum.PRODUCT]: {
    ...permissionToObject(Object.values(ProductPermission)),
  },
  [UserRoleEnum.PRODUCT_UNIT]: {
    ...permissionToObject(Object.values(ProductUnitPermission)),
  },
  [UserRoleEnum.REPORT]: {
    ...permissionToObject(Object.values(ReportPermission)),
    [ProductPermission.LIST]: true,
    [CustomerPermission.LIST]: true,
    [ProductUnitPermission.LIST]: true,
    [TransactionInPermission.LIST]: true,
    [InvoicePermission.LIST]: true,
    [PaymentMethodPermission.LIST]: true,
    [ProductPermission.VIEW]: true,
    [CustomerPermission.VIEW]: true,
    [ProductUnitPermission.VIEW]: true,
    [TransactionInPermission.VIEW]: true,
    [InvoicePermission.VIEW]: true,
    [PaymentMethodPermission.VIEW]: true,
  },
  [UserRoleEnum.SPB]: {
    ...permissionToObject(Object.values(SpbPermission)),
  },
  [UserRoleEnum.TRANSACTION_IN]: {
    ...permissionToObject(Object.values(TransactionInPermission)),
    [ProductPermission.LIST]: true,
    [CustomerPermission.LIST]: true,
    [ProductUnitPermission.LIST]: true,
    [TransactionInPermission.LIST]: true,
    [InvoicePermission.LIST]: true,
    [PaymentMethodPermission.LIST]: true,
    [ProductPermission.VIEW]: true,
    [CustomerPermission.VIEW]: true,
    [ProductUnitPermission.VIEW]: true,
    [TransactionInPermission.VIEW]: true,
    [InvoicePermission.VIEW]: true,
    [PaymentMethodPermission.VIEW]: true,
    [UserPermission.LIST]: true,
    [UserPermission.VIEW]: true,
  },
  [UserRoleEnum.TRANSACTION_OUT]: {
    ...permissionToObject(Object.values(TransactionOutPermission)),
  },
  [UserRoleEnum.ADMIN]: {
    ...permissionToObject(Object.values(ArPaymentPermission)),
    ...permissionToObject(Object.values(CashflowPermission)),
    ...permissionToObject(Object.values(ChargePermission)),
    ...permissionToObject(Object.values(CustomerPermission)),
    ...permissionToObject(Object.values(CustomerPaymentPermission)),
    ...permissionToObject(Object.values(InvoicePermission)),
    ...permissionToObject(Object.values(PaymentMethodPermission)),
    ...permissionToObject(Object.values(ProductPermission)),
    ...permissionToObject(Object.values(ProductUnitPermission)),
    ...permissionToObject(Object.values(ReportPermission)),
    ...permissionToObject(Object.values(SpbPermission)),
    ...permissionToObject(Object.values(TransactionInPermission)),
    ...permissionToObject(Object.values(TransactionInPermission)),
  },
});
