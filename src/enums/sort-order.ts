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
export enum InvoiceSort {
  ID = 'id',
  CUSTOMER = 'customer',
  INVOICE_NO = 'invoice_no',
  TOTAL_ORDER_CONVERTED = 'total_order_converted',
  TOTAL_AMOUNT = 'total_amount',
  STATUS = 'status',
  CREATED_AT = 'created_at',
}

export enum TransactionInSort {
  ID = 'id',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  QTY = 'qty',
  CREATED_AT = 'created_at',
  CONVERTED_QTY = 'converted_qty',
  UNIT = 'unit',
  TRANSACTION_IN_HEADER = 'transaction_in_header',
  IS_CHARGE = 'is_charge',
}

export enum TransactionInHeaderSort {
  ID = 'id',
  CUSTOMER = 'customer',
  CODE = 'code',
  CREATED_AT = 'created_at',
  IS_CHARGE = 'is_charge',
}

export type SortOrderQueryBuilder = 'ASC' | 'DESC';
