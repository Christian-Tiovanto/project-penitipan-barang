import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { ICharge } from '../models/charge.entity';
import { ChargeType } from '@app/enums/charge-type';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateChargeDto
  implements Omit<ICharge, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({
    example: ChargeType.PERCENTAGE,
  })
  @JoiSchema(Joi.string().valid(...Object.values(ChargeType)))
  type: ChargeType;

  @ApiProperty({ example: 5 })
  @JoiSchema(Joi.number().min(1).required())
  amount: number;
}
