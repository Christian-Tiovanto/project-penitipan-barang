import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { TransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateTransactionInDto
  implements
    Omit<
      TransactionIn,
      | 'id'
      | 'customer'
      | 'created_at'
      | 'updated_at'
      | 'product'
      | 'transaction_in_headerId'
      | 'transaction_in_header'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().optional())
  productId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().optional())
  customerId: number;

  @ApiProperty({ example: 10 })
  @JoiSchema(Joi.number().optional())
  qty: number;

  // @ApiProperty({ example: 500 })
  // @JoiSchema(Joi.number().optional())
  // price: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().optional())
  unitId: number;

  @JoiSchema(Joi.boolean().options({ convert: true }).optional())
  is_charge: boolean;

  unit: string;
  conversion_to_kg: number;
  remaining_qty: number;
  converted_qty: number;
}
