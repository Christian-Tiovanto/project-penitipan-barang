import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateTransactionInDto
  implements
    Omit<
      ITransactionIn,
      'id' | 'merchant' | 'created_at' | 'updated_at' | 'product' | 'unit'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().optional())
  productId: number;

  @ApiProperty({ example: 10 })
  @JoiSchema(Joi.number().optional())
  qty: number;

  @ApiProperty({ example: 500 })
  @JoiSchema(Joi.number().optional())
  price: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().optional())
  unitId: number;

  unit_name: string;
  conversion_to_kg: number;
  remaining_qty: number;
  final_qty: number;
}
