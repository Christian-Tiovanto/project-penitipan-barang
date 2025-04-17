import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { CashflowType } from '@app/enums/cashflow-type';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class GetAllCashflowQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({ example: CashflowType.IN, enum: CashflowType })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(CashflowType))
      .optional(),
  )
  type: CashflowType;
}
