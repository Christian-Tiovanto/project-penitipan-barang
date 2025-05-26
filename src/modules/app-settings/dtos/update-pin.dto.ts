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
  @ApiProperty({
    example: '12345',
    description: 'Password minimal 5 character and max 6 characters',
  })
  @JoiSchema(
    Joi.string()
      .pattern(/^\d{5}$/)
      .min(5)
      .max(5)
      .required()
      .messages({
        'string.pattern.base': 'PIN must be exactly 5 digits',
        'string.min': 'PIN must be 5 characters long',
        'string.max': 'PIN must be 5 characters long',
        'string.empty': 'PIN cannot be empty',
      }),
  )
  setting_value: string;
}
