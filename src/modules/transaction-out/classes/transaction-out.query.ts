import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { SortOrder } from '@app/enums/sort-order';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum TransactionOutSort {
  ID = 'id',
  PRODUCT = 'product',
  CUSTOMER = 'customer',
  CONVERTED_QTY = 'converted_qty',
  TOTAL_DAYS = 'total_days',
}

export class GetAllTransactionOutQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: TransactionOutSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(TransactionOutSort))
      .optional(),
  )
  sort: TransactionOutSort;

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
}
