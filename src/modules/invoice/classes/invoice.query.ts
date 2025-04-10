import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { ArStatus } from '@app/enums/ar-status';
import { InvoiceStatus } from '@app/enums/invoice-status';
import { InvoiceSort, SortOrder } from '@app/enums/sort-order';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class GetAllInvoiceQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: InvoiceSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(InvoiceSort))
      .optional(),
  )
  sort: InvoiceSort;

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
      .valid(...Object.values(InvoiceStatus))
      .optional(),
  )
  status?: InvoiceStatus;

  @ApiProperty({ example: '1', required: false })
  @JoiSchema(Joi.string().optional())
  customer: string;

  //   @ApiProperty({
  //     example: true,
  //     type: 'boolean',
  //     required: false,
  //     description:
  //       "`true`: doesn't populate `invoice`.\n\n`false` / null: populate `invoice`",
  //   })
  //   @JoiSchema(Joi.boolean().options({ convert: true }).optional())
  //   compact: boolean;
}
