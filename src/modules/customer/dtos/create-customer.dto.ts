import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { Customer } from '../models/customer.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateCustomerDto
  implements Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>
{
  @ApiProperty({ example: 'Customer Name' })
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty({ example: 'Customer Code' })
  @JoiSchema(Joi.string().required())
  code: string;

  @ApiProperty({ example: 'Customer Address' })
  @JoiSchema(Joi.string().required())
  address: string;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().optional())
  is_deleted: boolean;
}
