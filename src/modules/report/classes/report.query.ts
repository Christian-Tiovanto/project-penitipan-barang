import { EndDateQuery } from '@app/commons/queries/date-range.query';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class StockReportQuery extends EndDateQuery {
  @ApiProperty({ example: '1', required: false })
  @JoiSchema(Joi.string().optional())
  customer: string;
}
