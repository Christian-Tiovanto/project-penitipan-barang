import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IUser } from '../models/user';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdatePasswordDto implements Pick<IUser, 'password'> {
  @ApiProperty({
    example: '123456',
    description: 'Password minimal 6 character and max 24 characters',
  })
  @JoiSchema(Joi.string().min(6).max(24).required())
  password: string;

  @ApiProperty({
    example: '654321',
    description: 'New Password minimal 6 character and max 24 characters',
  })
  @JoiSchema(Joi.string().min(6).max(24).required())
  oldPassword: string;
}
