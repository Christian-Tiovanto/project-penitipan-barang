import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ISupplier } from '../models/supplier.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateSupplierDto
  implements Pick<ISupplier, 'name' | 'phone' | 'is_credit' | 'updated_by'>
{
  @ApiProperty({ example: 'Supplier Name' })
  @JoiSchema(Joi.string().optional())
  name: string;

  @ApiProperty({ example: '081312344321' })
  @JoiSchema(Joi.string().optional())
  phone: string;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().options({ convert: true }).optional())
  is_credit: boolean;

  updated_by: number;
}
