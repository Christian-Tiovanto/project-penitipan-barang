import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateTransactionInDto
  implements
    Omit<ITransactionIn, 'id' | 'merchant' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 'Supplier Name' })
  @JoiSchema(Joi.string().required())
  product: number;

  @ApiProperty({ example: 'Supplier Name' })
  @JoiSchema(Joi.string().required())
  qty: number;

  @ApiProperty({ example: 'Supplier Name' })
  @JoiSchema(Joi.string().optional())
  price: number;

  @ApiProperty({ example: 'Supplier Name' })
  @JoiSchema(Joi.string().required())
  unit: number;

  unit_name: string;
  conversion_to_kg: number;
  remaining_qty: number;
  final_qty: number;
}
