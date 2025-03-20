import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateTransactionInDto
  implements
    Omit<
      ITransactionIn,
      'id' | 'created_at' | 'updated_at' | 'merchant' | 'product' | 'unit'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  merchantId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  productId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  qty: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  price: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  unitId: number;

  unit_name: string;
  conversion_to_kg: number;
  final_qty: number;
  remaining_qty: number;
}
