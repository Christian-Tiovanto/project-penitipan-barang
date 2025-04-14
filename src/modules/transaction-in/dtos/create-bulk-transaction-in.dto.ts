import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionIn } from '../models/transaction-in.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

export class BulkTransactionInDetailDto
  implements
    Omit<
      ITransactionIn,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'customer'
      | 'product'
      | 'transaction_in_header'
    >
{
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
  customerId: number;
  transaction_in_headerId: number;
}

@JoiSchemaOptions({ allowUnknown: false })
export class CreateBulkTransactionInDto
  implements Pick<ITransactionIn, 'customerId'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  customerId: number;

  @ApiProperty({
    type: [BulkTransactionInDetailDto],
  })
  @JoiSchema(BulkTransactionInDetailDto, (schema) =>
    Joi.array().items(schema).min(1).required(),
  )
  data: BulkTransactionInDetailDto[];
}
