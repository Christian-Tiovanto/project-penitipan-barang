import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum TransactionInSort {
  ID = 'id',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  QTY = 'qty',
}

export class GetAllTransactionInQuery extends BasePaginationQuery {
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
}
