import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ICustomerPayment } from '../models/customer-payment.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateCustomerPaymentDto
  implements
  Omit<
    ICustomerPayment,
    'id' | 'created_at' | 'updated_at' | 'customer' | 'payment_method'
  >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  customerId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  payment_methodId: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  charge: number;

  // @ApiProperty({ example: 1000 })
  // @JoiSchema(Joi.number().required())
  // up_price: number;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().optional())
  status: boolean;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().min(1).required())
  min_pay: number;
}
