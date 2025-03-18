import { IUser } from '@app/modules/user/models/user';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';

@JoiSchemaOptions({ allowUnknown: false })
export class LoginDto implements Pick<IUser, 'email' | 'password'> {
  @ApiProperty({ example: 'test@gmail.com' })
  @JoiSchema(Joi.string().required())
  email: string;

  @ApiProperty({ example: '123456' })
  @JoiSchema(Joi.string().required())
  password: string;
}
