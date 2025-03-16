import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IUser } from '../models/user';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@app/enums/user-role';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateUserDto implements Omit<IUser, 'id'> {
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  merchant: number;

  @ApiProperty({ example: 'test@gmail.com' })
  @JoiSchema(Joi.string().required())
  email: string;

  @ApiProperty({ example: UserRole.DEFAULT, enum: UserRole })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(UserRole))
      .required(),
  )
  role: UserRole;

  @ApiProperty({ example: 'John Doe' })
  @JoiSchema(Joi.string().required())
  fullname: string;

  @ApiProperty({
    example: '123456',
    description: 'Password minimal 6 character and max 24 characters',
  })
  @JoiSchema(Joi.string().min(6).max(24).required())
  password: string;

  @ApiProperty({ example: 'Jl. Merak Jingga' })
  @JoiSchema(Joi.string().optional())
  address: string;

  @ApiProperty({ example: '081312345678' })
  @JoiSchema(Joi.string().required())
  phone: string;
}
