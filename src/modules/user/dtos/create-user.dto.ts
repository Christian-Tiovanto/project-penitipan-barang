import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IUser } from '../models/user';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateUserDto
  implements Omit<IUser, 'id' | 'is_deleted' | 'user_role'>
{
  // @ApiProperty({ example: 1 })
  // @JoiSchema(Joi.number().required())
  // merchant: number;

  @ApiProperty({ example: 'test@gmail.com' })
  @JoiSchema(Joi.string().required())
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @JoiSchema(Joi.string().required())
  fullname: string;

  @ApiProperty({
    example: '123456',
    description: 'Password minimal 6 character and max 24 characters',
  })
  @JoiSchema(Joi.string().min(6).max(24).required())
  password: string;

  // @ApiProperty({
  //   example: '12345',
  //   description: 'Password minimal 5 character and max 6 characters',
  // })
  // @JoiSchema(
  //   Joi.string()
  //     .pattern(/^\d{5}$/)
  //     .min(5)
  //     .max(5)
  //     .required()
  //     .messages({
  //       'string.pattern.base': 'PIN must be exactly 5 digits',
  //       'string.min': 'PIN must be 5 characters long',
  //       'string.max': 'PIN must be 5 characters long',
  //       'string.empty': 'PIN cannot be empty',
  //     }),
  // )
  // pin: string;

  // @ApiProperty({ example: 'Jl. Merak Jingga' })
  // @JoiSchema(Joi.string().optional())
  // address: string;

  // @ApiProperty({ example: '081312345678' })
  // @JoiSchema(Joi.string().required())
  // phone: string;
}
