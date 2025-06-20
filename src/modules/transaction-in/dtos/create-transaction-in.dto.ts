import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { TransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateTransactionInDto
  implements
    Omit<
      TransactionIn,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'customer'
      | 'product'
      | 'transaction_in_headerId'
      | 'transaction_in_header'
      | 'is_charge'
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
