import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ISpb } from '../models/spb.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateSpbDto
  implements
    Omit<ISpb, 'id' | 'created_at' | 'updated_at' | 'customer' | 'invoice'>
{
  // @ApiProperty({ example: 1 })
  // @JoiSchema(Joi.number().integer().required())
  customerId: number;

  // @ApiProperty({ example: 1 })
  // @JoiSchema(Joi.number().integer().required())
  invoiceId: number;

  // @ApiProperty({ example: 'Plat No' })
  // @JoiSchema(Joi.string().required())
  no_plat: string;

  // @ApiProperty({ example: '2025-03-22T15:30:00.000Z' })
  // @JoiSchema(Joi.date().required())
  clock_out: Date;

  created_at: Date;
  updated_at: Date;
}

export class TransactionOutSpbDto extends OmitType(CreateSpbDto, [
  'invoiceId',
] as const) {
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().integer().required())
  customerId: number;

  @ApiProperty({ example: 'Plat No' })
  @JoiSchema(Joi.string().required())
  no_plat: string;

  @ApiProperty({ example: '2025-03-22T15:30:00.000Z' })
  @JoiSchema(Joi.date().required())
  clock_out: Date;
}
