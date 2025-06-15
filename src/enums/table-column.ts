// Enums for database table columns to ensure type-safety and prevent typos.

export enum AppSettingsColumn {
  ID = 'id',
  SETTING_NAME = 'setting_name',
  SETTING_VALUE = 'setting_value',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum ArColumn {
  ID = 'id',
  CUSTOMER_ID = 'customerId',
  INVOICE_ID = 'invoiceId',
  AR_NO = 'ar_no',
  TOTAL_BILL = 'total_bill',
  TOTAL_PAID = 'total_paid',
  TO_PAID = 'to_paid',
  STATUS = 'status',
  PAID_DATE = 'paid_date',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum ArPaymentColumn {
  ID = 'id',
  AR_ID = 'arId',
  PAYMENT_METHOD_NAME = 'payment_method_name',
  CUSTOMER_PAYMENT_ID = 'customer_paymentId',
  CUSTOMER_ID = 'customerId',
  TOTAL_PAID = 'total_paid',
  TRANSFER_DATE = 'transfer_date',
  REFERENCE_NO = 'reference_no',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum CashflowsColumn {
  ID = 'id',
  TYPE = 'type',
  FROM = 'from',
  AMOUNT = 'amount',
  DESCRIPTIONS = 'descriptions',
  TOTAL_AMOUNT = 'total_amount',
  CREATED_BY_ID = 'created_byId',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum ChargesColumn {
  ID = 'id',
  TYPE = 'type',
  AMOUNT = 'amount',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum CustomerPaymentsColumn {
  ID = 'id',
  CUSTOMER_ID = 'customerId',
  PAYMENT_METHOD_ID = 'payment_methodId',
  CHARGE = 'charge',
  STATUS = 'status',
  SORT = 'sort',
  MIN_PAY = 'min_pay',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum CustomersColumn {
  ID = 'id',
  NAME = 'name',
  CODE = 'code',
  ADDRESS = 'address',
  IS_DELETED = 'is_deleted',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum InvoicesColumn {
  ID = 'id',
  CUSTOMER_ID = 'customerId',
  INVOICE_NO = 'invoice_no',
  TOTAL_AMOUNT = 'total_amount',
  CHARGE = 'charge',
  FINE = 'fine',
  DISCOUNT = 'discount',
  TOTAL_ORDER = 'total_order',
  TOTAL_ORDER_CONVERTED = 'total_order_converted',
  TAX = 'tax',
  STATUS = 'status',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum PaymentMethodsColumn {
  ID = 'id',
  NAME = 'name',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum ProductUnitsColumn {
  ID = 'id',
  PRODUCT_ID = 'productId',
  NAME = 'name',
  CONVERSION_TO_KG = 'conversion_to_kg',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum ProductsColumn {
  ID = 'id',
  NAME = 'name',
  PRICE = 'price',
  QTY = 'qty',
  DESC = 'desc',
  IS_DELETED = 'is_deleted',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum SpbColumn {
  ID = 'id',
  CUSTOMER_ID = 'customerId',
  INVOICE_ID = 'invoiceId',
  NO_PLAT = 'no_plat',
  CLOCK_OUT = 'clock_out',
  DESC = 'desc',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum TransactionInHeaderColumn {
  ID = 'id',
  CUSTOMER_ID = 'customerId',
  CODE = 'code',
  DESC = 'desc',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum TransactionInsColumn {
  ID = 'id',
  CUSTOMER_ID = 'customerId',
  PRODUCT_ID = 'productId',
  TRANSACTION_IN_HEADER_ID = 'transaction_in_headerId',
  QTY = 'qty',
  CONVERTED_QTY = 'converted_qty',
  REMAINING_QTY = 'remaining_qty',
  FINAL_QTY = 'final_qty',
  UNIT = 'unit',
  CONVERSION_TO_KG = 'conversion_to_kg',
  IS_CHARGE = 'is_charge',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum TransactionOutsColumn {
  ID = 'id',
  PRODUCT_ID = 'productId',
  PRODUCT_NAME = 'productName',
  CUSTOMER_ID = 'customerId',
  TRANSACTION_IN_ID = 'transaction_inId',
  INVOICE_ID = 'invoiceId',
  SPB_ID = 'spbId',
  QTY = 'qty',
  CONVERTED_QTY = 'converted_qty',
  CONVERSION_TO_KG = 'conversion_to_kg',
  UNIT = 'unit',
  TOTAL_PRICE = 'total_price',
  TOTAL_FINE = 'total_fine',
  TOTAL_CHARGE = 'total_charge',
  IS_CHARGE = 'is_charge',
  PRICE = 'price',
  TOTAL_DAYS = 'total_days',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum UserRolesColumn {
  ID = 'id',
  USER_ID = 'userId',
  ROLE = 'role',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}

export enum UsersColumn {
  ID = 'id',
  FULLNAME = 'fullname',
  EMAIL = 'email',
  PASSWORD = 'password',
  IS_DELETED = 'is_deleted',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
}
