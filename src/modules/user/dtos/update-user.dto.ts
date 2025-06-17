import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { User } from '../models/user';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateUserDto
  implements Omit<User, 'id' | 'password' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 'test@gmail.com' })
  @JoiSchema(Joi.string().optional())
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @JoiSchema(Joi.string().optional())
  fullname: string;
}
