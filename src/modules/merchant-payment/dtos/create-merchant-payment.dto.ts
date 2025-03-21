import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IMerchantPayment } from '../models/merchant-payment.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateMerchantPaymentDto
  implements Omit<IMerchantPayment, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  merchant: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  payment_method: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  charge: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  up_price: number;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().optional())
  status: boolean;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().optional())
  sort: boolean;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  min_pay: number;
}
