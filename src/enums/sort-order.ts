export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ArSort {
  ID = 'id',
  CUSTOMER = 'customer',
  AR_NO = 'ar_no',
  AR_PAYMENT = 'ar_payment',
  TOTAL_BILL = 'total_bill',
  TOTAL_PAID = 'total_paid',
  TO_PAID = 'to_paid',
  CREATED_AT = 'created_at',
}
export type SortOrderQueryBuilder = 'ASC' | 'DESC';
