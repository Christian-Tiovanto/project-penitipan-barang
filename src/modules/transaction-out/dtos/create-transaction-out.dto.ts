import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ITransactionOut } from '../models/transaction-out.entity';
import { Spb } from '@app/modules/spb/models/spb.entity';
import { TransactionOutSpbDto } from '@app/modules/spb/dtos/create-spb.dto';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateTransactionOutDto
  implements
    Omit<
      ITransactionOut,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'customer'
      | 'product'
      | 'invoice'
      | 'spb'
      | 'transaction_in'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  productId: number;

  // @ApiProperty({ example: 1 })
  // @JoiSchema(Joi.number().required())
  customerId: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  converted_qty: number;

  transaction_inId: number;

  invoiceId: number;
  spbId: number;
  qty: number;
  conversion_to_kg: number;
  unit: string;
  total_price: number;
  total_fine: number;
  total_charge: number;
  price: number;
  total_days: number;
}

export class CreateTransactionOutWithSpbDto extends TransactionOutSpbDto {
  @ApiProperty({ type: () => [CreateTransactionOutDto] })
  @JoiSchema(Joi.array().items(Joi.object()).min(1)) // Bisa 1 transaksi atau lebih
  transaction_outs: CreateTransactionOutDto[];

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  transaction_in_headerId: number;
}
