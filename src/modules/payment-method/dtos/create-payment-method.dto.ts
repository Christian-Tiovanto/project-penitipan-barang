import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IPaymentMethod } from '../models/payment-method.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreatePaymentMethodDto
  implements Omit<IPaymentMethod, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 'Payment Method Name' })
  @JoiSchema(Joi.string().required())
  name: string;

}
