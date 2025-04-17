import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum CustomerPaymentSort {
  ID = 'id',
  CUSTOMER = 'customer',
  PAYMENT_METHOD = 'payment_method',
  CHARGE = 'charge',
  STATUS = 'status',
  MIN_PAY = 'min_pay',
}

export class GetAllCustomerPaymentQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: CustomerPaymentSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(CustomerPaymentSort))
      .optional(),
  )
  sort: CustomerPaymentSort;

  @ApiProperty({
    enum: SortOrder,
    required: false,
    description: 'default order is `asc`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(SortOrder))
      .optional(),
  )
  order?: SortOrder;

  @ApiProperty({
    example: '',
    description:
      'Search Custmomer payment based on customer ,payment method , charge , status ,  min_pay',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
