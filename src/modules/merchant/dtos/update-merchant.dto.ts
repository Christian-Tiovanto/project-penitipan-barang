import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IMerchant } from '../models/merchant.entity';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateMerchantDto
  implements Omit<IMerchant, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 'Update Merchant A' })
  @JoiSchema(Joi.string().optional())
  name: string;

  @ApiProperty({ example: 'Update Address Merchant A' })
  @JoiSchema(Joi.string().optional())
  address: string;

  @ApiProperty({ example: new Date() })
  @JoiSchema(Joi.date().iso().options({ convert: true }).optional())
  opened_time: Date;

  @ApiProperty({ example: new Date() })
  @JoiSchema(Joi.date().iso().options({ convert: true }).optional())
  closed_time: Date;

  @ApiProperty({ example: 81311112222 })
  @JoiSchema(Joi.string().optional())
  phone: string;

  @ApiProperty({ example: 81311112222 })
  @JoiSchema(Joi.string().optional())
  npwp: string;

  @ApiProperty({ example: '081311112222' })
  @JoiSchema(Joi.string().optional())
  nppbkc: string;

  @ApiProperty({ example: 'Update Office Merchant A' })
  @JoiSchema(Joi.string().optional())
  office: string;

  @ApiProperty({ example: 'Update Office Code Merchant A' })
  @JoiSchema(Joi.string().optional())
  office_code: string;

  @ApiProperty({ example: 'CIMB' })
  @JoiSchema(Joi.string().optional())
  bank_name: string;

  @ApiProperty({ example: 654321 })
  @JoiSchema(Joi.string().optional())
  bank_account_number: string;

  @ApiProperty({ example: 11 })
  @JoiSchema(Joi.number().optional())
  tax: number;

  @ApiProperty({ example: 'update.jpg' })
  @JoiSchema(Joi.string().optional())
  logo_name: string;
}
