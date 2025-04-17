import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { SortOrder, TransactionInHeaderSort } from '@app/enums/sort-order';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class GetAllTransactionInHeaderQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: TransactionInHeaderSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(TransactionInHeaderSort))
      .optional(),
  )
  sort: TransactionInHeaderSort;

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
