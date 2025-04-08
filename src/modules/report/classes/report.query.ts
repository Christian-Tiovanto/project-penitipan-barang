import {
  EndDateQuery,
  OptionalDateRangeQueryWithPagination,
} from '@app/commons/queries/date-range.query';
import { ArSort, SortOrder } from '@app/enums/sort-order';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class StockReportQuery extends EndDateQuery {
  @ApiProperty({ example: '1', required: false })
  @JoiSchema(Joi.string().optional())
  customer: string;
}

export class ArPaidReportQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: ArSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(ArSort))
      .optional(),
  )
  sort: ArSort;

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
    example: true,
    type: 'boolean',
    required: false,
    description:
      'true: doesn`t populate invoice.\n\nfalse / null: populate invoice',
  })
  @JoiSchema(Joi.boolean().options({ convert: true }).optional())
  compact: boolean;
}
