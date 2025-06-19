import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export enum PaymentMethodSort {
  ID = 'id',
  NAME = 'name',
}

export class GetAllPaymentMethodQuery extends BasePaginationQuery {
  @ApiProperty({
    enum: PaymentMethodSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(PaymentMethodSort))
      .optional(),
  )
  sort: PaymentMethodSort;

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
    description: 'Search Payment Method based on namee',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
