import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ICustomer } from '../models/customer.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateCustomerDto implements Partial<Omit<ICustomer, 'id' | 'created_at' | 'updated_at'>>{
  @ApiProperty({ example: 'Customer Name' })
  @JoiSchema(Joi.string().optional())
  name?: string;

  @ApiProperty({ example: 'Customer Address' })
  @JoiSchema(Joi.string().optional())
  address: string;

  @ApiProperty({ example: 'Customer Identity' })
  @JoiSchema(Joi.string().optional())
  identity: string;

  @ApiProperty({ example: 'Customer Identity Number' })
  @JoiSchema(Joi.string().optional())
  identity_number: string;

  @ApiProperty({ example: 'Customer Office' })
  @JoiSchema(Joi.string().optional())
  office: string;

  @ApiProperty({ example: 'Customer Office Code' })
  @JoiSchema(Joi.string().optional())
  office_code: string;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().optional())
  is_credit: boolean;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().optional())
  is_deleted?: boolean;

  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  updated_by?: number;
}
