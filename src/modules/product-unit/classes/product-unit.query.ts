import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum ProductUnitSort {
  ID = 'id',
  name = 'name',
  PRODUCT = 'product',
  CONVERSION_TO_KG = 'conversion_to_kg',
}

export class GetAllProductUnitQuery extends BasePaginationQuery {
  @ApiProperty({
    enum: ProductUnitSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(ProductUnitSort))
      .optional(),
  )
  sort: ProductUnitSort;

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
      'Search product unit based on name , product , conversion to kg',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
