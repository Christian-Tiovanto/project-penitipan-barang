import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IAr } from '../models/ar.entity';
import { ArStatus } from '@app/enums/ar-status';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateArDto
  implements Omit<IAr, 'id' | 'created_at' | 'updated_at' | 'customer' | 'invoice'>
{
  customerId: number;
  invoiceId: number;
  ar_no: string;
  total_bill: number;
  to_paid: number;
  status: ArStatus;
  paid_date: Date;
}
