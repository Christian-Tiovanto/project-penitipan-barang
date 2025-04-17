import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ICharge } from '../models/charge.entity';
import { ChargeType } from '@app/enums/charge-type';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateChargeDto
  implements Partial<Omit<ICharge, 'id' | 'created_at' | 'updated_at'>>
{
  @ApiProperty({ example: ChargeType.NOMINAL })
  @JoiSchema(Joi.string().valid(...Object.values(ChargeType)))
  type?: ChargeType;

  @ApiProperty({ example: 10000 })
  @JoiSchema(Joi.number().min(1).optional())
  amount?: number;
}
