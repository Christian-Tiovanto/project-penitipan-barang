import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { Customer } from '../models/customer.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateCustomerDto
  implements Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
{
  @ApiProperty({ example: 'Customer Name' })
  @JoiSchema(Joi.string().optional())
  name?: string;

  @ApiProperty({ example: 'Customer Name' })
  @JoiSchema(Joi.string().optional())
  code?: string;

  @ApiProperty({ example: 'Customer Address' })
  @JoiSchema(Joi.string().optional())
  address: string;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().optional())
  is_deleted?: boolean;
}
