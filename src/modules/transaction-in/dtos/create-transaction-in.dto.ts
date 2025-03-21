import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateTransactionInDto
  implements
    Omit<
      ITransactionIn,
      'id' | 'created_at' | 'updated_at' | 'customer' | 'product'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  customerId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  productId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  qty: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  unitId: number;

  unit: string;
  conversion_to_kg: number;
  remaining_qty: number;
  converted_qty: number;
}
