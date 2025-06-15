import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from '@app/enums/user-role';
import { UserRole } from '../models/user-role';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateUserRoleDto
  implements Omit<UserRole, 'id' | 'user' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  userId: number;

  @ApiProperty({ example: UserRoleEnum.DEFAULT, enum: UserRoleEnum })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(UserRoleEnum))
      .required(),
  )
  role: UserRoleEnum;
}
