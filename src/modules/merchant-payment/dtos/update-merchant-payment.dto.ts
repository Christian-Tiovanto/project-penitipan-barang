import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IMerchantPayment } from '../models/merchant-payment.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateMerchantPaymentDto implements Partial<Omit<IMerchantPayment, 'id' | 'created_at' | 'updated_at'>>{
  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  charge: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  up_price: number;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().optional())
  status: boolean;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().optional())
  sort: boolean;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  min_pay: number;
}
