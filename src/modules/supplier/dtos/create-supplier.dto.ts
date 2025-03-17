import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ISupplier } from '../models/supplier.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateSupplierDto
  implements
    Pick<ISupplier, 'merchant' | 'name' | 'phone' | 'is_credit' | 'created_by'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  merchant: number;

  @ApiProperty({ example: 'Supplier Name' })
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty({ example: '081312344321' })
  @JoiSchema(Joi.string().required())
  phone: string;

  @ApiProperty({ example: true })
  @JoiSchema(Joi.boolean().options({ convert: true }).required())
  is_credit: boolean;

  created_by: number;
}
