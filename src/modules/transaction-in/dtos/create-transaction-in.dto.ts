import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateTransactionInDto
  implements Omit<ITransactionIn, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  merchant: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  product: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  qty: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  price: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.string().required())
  unit: number;

  unit_name: string;
  conversion_to_kg: number;
  final_qty: number;
  remaining_qty: number;
}
