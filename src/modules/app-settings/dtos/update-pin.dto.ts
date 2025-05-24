import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IAppSettings } from '../models/app-settings.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateSecurityPinDto
  implements Pick<IAppSettings, 'setting_value'>
{
  @ApiProperty({ example: '654321' })
  @JoiSchema(Joi.string().required())
  setting_value: string;
}
