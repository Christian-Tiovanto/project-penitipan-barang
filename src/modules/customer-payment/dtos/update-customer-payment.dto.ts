import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ICustomerPayment } from '../models/customer-payment.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateCustomerPaymentDto
  implements Partial<Omit<ICustomerPayment, 'id' | 'created_at' | 'updated_at'>>
{
  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  charge: number;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().optional())
  status: boolean;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  min_pay: number;
}
