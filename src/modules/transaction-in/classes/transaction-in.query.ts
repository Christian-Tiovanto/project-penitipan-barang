import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { SortOrder } from '@app/enums/sort-order';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum TransactionInSort {
  ID = 'id',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  QTY = 'qty',
  CREATED_AT = 'created_at',
  UNIT = 'unit',
}

export class GetAllTransactionInQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: TransactionInSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(TransactionInSort))
      .optional(),
  )
  sort: TransactionInSort;

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
    description: 'Search transaction-in based on Customer name',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
