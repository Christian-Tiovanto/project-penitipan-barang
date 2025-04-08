export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ArSort {
  ID = 'id',
  CUSTOMER = 'customer',
  INVOICE = 'invoice',
  TOTAL_BILL = 'total_bill',
  TO_PAID = 'to_paid',
}
export type SortOrderQueryBuilder = 'ASC' | 'DESC';
