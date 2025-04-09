import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IArPayment } from '../models/ar-payment.entity';

export class BulkArPaymentDetailDto
  implements Pick<IArPayment, 'arId' | 'total_paid'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  arId: number;

  @ApiProperty({ example: 10000 })
  @JoiSchema(Joi.number().required())
  total_paid: number;
}

@JoiSchemaOptions({ allowUnknown: false })
export class CreateBulkArPaymentDto
  implements
    Omit<
      IArPayment,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'ar'
      | 'customer_payment'
      | 'customer'
      | 'arId'
      | 'customerId'
      | 'total_paid'
      | 'customer_paymentId'
    >
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  payment_methodId: number;

  @ApiProperty({ example: new Date() })
  @JoiSchema(Joi.date().required())
  transfer_date: Date;

  @ApiProperty({
    type: [BulkArPaymentDetailDto],
  })
  @JoiSchema(BulkArPaymentDetailDto, (schema) =>
    Joi.array().items(schema).min(1).required(),
  )
  data: BulkArPaymentDetailDto[];

  @ApiProperty({ example: 'REF-1' })
  @JoiSchema(Joi.string().optional())
  reference_no: string;

  payment_method_name: string;
}
