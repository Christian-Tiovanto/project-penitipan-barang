import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IMerchant } from '../models/merchant.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateMerchantDto
  implements Omit<IMerchant, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 'Merchant A' })
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty({ example: 'Address Merchant A' })
  @JoiSchema(Joi.string().required())
  address: string;

  @ApiProperty({ example: new Date() })
  @JoiSchema(Joi.date().iso().options({ convert: true }).optional())
  opened_time: Date;

  @ApiProperty({ example: new Date() })
  @JoiSchema(Joi.date().iso().options({ convert: true }).optional())
  closed_time: Date;

  @ApiProperty({ example: '081344445555' })
  @JoiSchema(Joi.string().required())
  phone: string;

  @ApiProperty({ example: 81344445555 })
  @JoiSchema(Joi.string().required())
  npwp: string;

  @ApiProperty({ example: 81344445555 })
  @JoiSchema(Joi.string().required())
  nppbkc: string;

  @ApiProperty({ example: 'Office Merchant A' })
  @JoiSchema(Joi.string().required())
  office: string;

  @ApiProperty({ example: 'Office Code Merchant A' })
  @JoiSchema(Joi.string().required())
  office_code: string;

  @ApiProperty({ example: 'BCA' })
  @JoiSchema(Joi.string().required())
  bank_name: string;

  @ApiProperty({ example: 123456 })
  @JoiSchema(Joi.string().required())
  bank_account_number: string;

  @ApiProperty({ example: 5 })
  @JoiSchema(Joi.number().required())
  tax: number;

  @ApiProperty({ example: 'tes.jpg' })
  @JoiSchema(Joi.string().required())
  logo_name: string;
}
