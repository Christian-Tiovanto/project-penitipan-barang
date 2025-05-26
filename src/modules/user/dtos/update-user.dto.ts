import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IUser } from '../models/user';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '@app/enums/user-role';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateUserDto
  implements Omit<IUser, 'id' | 'password' | 'user_role'>
{
  @ApiProperty({ example: 'test@gmail.com' })
  @JoiSchema(Joi.string().optional())
  email: string;

  @ApiProperty({ example: UserRoleEnum.DEFAULT, enum: UserRoleEnum })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(UserRoleEnum))
      .optional(),
  )
  role: UserRoleEnum;

  @ApiProperty({ example: 'John Doe' })
  @JoiSchema(Joi.string().optional())
  fullname: string;

  @ApiProperty({ example: 'Jl. Merak Jingga' })
  @JoiSchema(Joi.string().optional())
  address: string;

  @ApiProperty({ example: '081312345678' })
  @JoiSchema(Joi.string().optional())
  phone: string;

  // @ApiProperty({
  //   example: '12345',
  //   description: 'Password minimal 5 character and max 5 characters',
  // })
  // @JoiSchema(
  //   Joi.string()
  //     .pattern(/^\d{5}$/)
  //     .min(5)
  //     .max(5)
  //     .optional()
  //     .messages({
  //       'string.pattern.base': 'PIN must be exactly 5 digits',
  //       'string.min': 'PIN must be 5 characters long',
  //       'string.max': 'PIN must be 5 characters long',
  //     }),
  // )
  // pin: string;
}
