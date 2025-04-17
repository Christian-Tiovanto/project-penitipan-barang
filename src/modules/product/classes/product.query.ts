import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum ProductSort {
  ID = 'id',
  NAME = 'name',
  PRICE = 'price',
  QTY = 'qty',
  DESC = 'desc',
}

export class GetAllProductQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: ProductSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(ProductSort))
      .optional(),
  )
  sort: ProductSort;

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
    description: 'Search Product based on name,price,qty,desc',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
