import { JoiSchemaOptions } from 'joi-class-decorators';
import { IAr } from '../models/ar.entity';
import { ArStatus } from '@app/enums/ar-status';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateArDto
  implements
    Omit<
      IAr,
      'id' | 'created_at' | 'updated_at' | 'customer' | 'invoice' | 'total_paid'
    >
{
  customerId: number;
  invoiceId: number;
  ar_no: string;
  total_bill: number;
  to_paid: number;
  status: ArStatus;
  paid_date: Date;
  created_at: Date;
  updated_at: Date;
}
