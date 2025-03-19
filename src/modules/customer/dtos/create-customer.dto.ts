import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ICustomer } from '../models/customer.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateCustomerDto
  implements Omit<ICustomer, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  merchant: number;

  @ApiProperty({ example: 'Customer Name' })
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty({ example: 'Customer Address' })
  @JoiSchema(Joi.string().required())
  address: string;

  @ApiProperty({ example: 'Customer Identity' })
  @JoiSchema(Joi.string().required())
  identity: string;

  @ApiProperty({ example: 'Customer Identity Number' })
  @JoiSchema(Joi.string().required())
  identity_number: string;

  @ApiProperty({ example: 'Customer Office' })
  @JoiSchema(Joi.string().required())
  office: string;

  @ApiProperty({ example: 'Customer Office Code' })
  @JoiSchema(Joi.string().required())
  office_code: string;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().required())
  is_credit: boolean;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().optional())
  is_deleted: boolean;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  created_by: number;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  updated_by: number;
}
