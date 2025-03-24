import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IInvoice } from '../models/invoice.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateInvoiceDto
  implements Omit<IInvoice, 'id' | 'created_at' | 'updated_at' | 'customer' | ''>
{
  // @ApiProperty({ example: 1 })
  // @JoiSchema(Joi.number().required())
  customerId: number;
  invoice_no: string;
  total_amount: number;
  charge: number;
  fine: number;
  discount: number;
  total_order: number;
  total_order_converted: number;
  tax: number;
  status: string;
}
