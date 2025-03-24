import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionOut } from '../models/transaction-out.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateTransactionOutDto implements Partial<Omit<ITransactionOut, 'id' | 'created_at' | 'updated_at'>>{
  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  total_price: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  qty: number;
}
