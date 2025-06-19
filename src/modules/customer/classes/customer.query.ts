import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum CustomerSort {
  ID = 'id',
  NAME = 'name',
  CODE = 'code',
  ADDRESS = 'address',
}

export class GetAllCustomerQuery extends BasePaginationQuery {
  @ApiProperty({
    enum: CustomerSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(CustomerSort))
      .optional(),
  )
  sort: CustomerSort;

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
    description: 'Search Custmomer based on name , code , address',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
