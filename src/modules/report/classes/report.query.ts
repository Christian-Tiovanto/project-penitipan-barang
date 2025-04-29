import {
  EndDateQuery,
  OptionalDateRangeQueryWithPagination,
} from '@app/commons/queries/date-range.query';
import { ArStatus } from '@app/enums/ar-status';
import { ArSort, SortOrder } from '@app/enums/sort-order';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class StockReportQuery extends EndDateQuery {
  @ApiProperty({ example: '1', required: false })
  @JoiSchema(Joi.string().optional())
  customer: string;
}

export class StockInvoiceReportQuery {
  @ApiProperty({ example: '1', required: false })
  @JoiSchema(Joi.string().optional())
  invoice: string;
}

export class AgingReportQuery {
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
    enum: ArStatus,
    required: false,
    description: 'default order is `asc`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(ArStatus))
      .optional(),
  )
  status?: ArStatus;

  @ApiProperty({ example: '1', required: false })
  @JoiSchema(Joi.string().optional())
  customer: string;

  @ApiProperty({
    example: true,
    type: 'boolean',
    required: false,
    description:
      "`true`: doesn't populate `invoice`.\n\n`false` / null: populate `invoice`",
  })
  @JoiSchema(Joi.boolean().options({ convert: true }).optional())
  compact: boolean;

  @ApiProperty({
    example: true,
    type: 'boolean',
    required: false,
    description:
      "`true`: populate `ar_payment` .\n\n`false` / null: doesn't populate `ar_payment`",
  })
  @JoiSchema(Joi.boolean().options({ convert: true }).optional())
  with_payment: boolean;
}
