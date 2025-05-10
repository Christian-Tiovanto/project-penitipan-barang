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

  converted_qty: number;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().required())
  is_charge: boolean;

  transaction_inId: number;

  invoiceId: number;
  spbId: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  qty: number;

  conversion_to_kg: number;
  unit: string;
  total_price: number;
  total_fine: number;
  total_charge: number;
  price: number;
  total_days: number;
  created_at: Date;
  updated_at: Date;
}

export class CreateTransactionOutWithSpbDto extends TransactionOutSpbDto {
  @ApiProperty({ type: () => [CreateTransactionOutDto] })
  @JoiSchema(Joi.array().items(Joi.object()).min(1)) // Bisa 1 transaksi atau lebih
  transaction_outs: CreateTransactionOutDto[];

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  transaction_in_headerId: number;

  @ApiProperty({ example: '2025-04-29T00:00:00Z' })
  @JoiSchema(Joi.date().required())
  transaction_date: Date;
}

export class CreateTransactionOutFifoWithSpbDto extends TransactionOutSpbDto {
  @ApiProperty({ type: () => [CreateTransactionOutDto] })
  @JoiSchema(Joi.array().items(Joi.object()).min(1)) // Bisa 1 transaksi atau lebih
  transaction_outs: CreateTransactionOutDto[];

  @ApiProperty({ example: '2025-04-29T00:00:00Z' })
  @JoiSchema(Joi.date().required())
  transaction_date: Date;
}
