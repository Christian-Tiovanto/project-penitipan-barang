import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionInHeader } from '../models/transaction-in-header.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateTransactionInHeaderDto
  implements Pick<TransactionInHeader, 'customerId' | 'desc'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().optional())
  customerId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.string().optional())
  desc: string;
}
