import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IUser } from '../models/user';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@app/enums/user-role';

@JoiSchemaOptions({ allowUnknown: false })
export class UpdateUserDto
  implements Omit<IUser, 'id' | 'password' | 'merchant'>
{
  @ApiProperty({ example: 'test@gmail.com' })
  @JoiSchema(Joi.string().optional())
  email: string;

  @ApiProperty({ example: UserRole.DEFAULT, enum: UserRole })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(UserRole))
      .optional(),
  )
  role: UserRole;

  @ApiProperty({ example: 'John Doe' })
  @JoiSchema(Joi.string().optional())
  fullname: string;

  @ApiProperty({ example: 'Jl. Merak Jingga' })
  @JoiSchema(Joi.string().optional())
  address: string;

  @ApiProperty({ example: '081312345678' })
  @JoiSchema(Joi.string().optional())
  phone: string;
}
