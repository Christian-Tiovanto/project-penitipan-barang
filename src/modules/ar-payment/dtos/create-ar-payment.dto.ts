import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IArPayment } from '../models/ar-payment.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateArPaymentDto
  implements
    Omit<
      IArPayment,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'accreceivable'
      | 'customer_payment'
      | 'customer'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  accreceivableId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  customer_paymentId: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  customerId: number;

  @JoiSchema(Joi.number().min(1).required())
  total_paid: number;

  @JoiSchema(Joi.date().required())
  transfer_date: Date;

  @JoiSchema(Joi.number().optional())
  reference_no: string;
}
