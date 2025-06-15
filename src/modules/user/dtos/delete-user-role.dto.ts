import { UserRoleEnum } from '@app/enums/user-role';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
import { UserRole } from '../models/user-role';

export class DeleteUserRoleDto implements Pick<UserRole, 'userId' | 'role'> {
  @ApiProperty({ example: '646ec97347d22fdce612bb4f' })
  @JoiSchema(Joi.number().required())
  userId!: number;

  @ApiProperty({ example: UserRoleEnum.DEFAULT })
  @JoiSchema(
    Joi.string()
      .valid(
        ...Object.values(UserRoleEnum).filter(
          (role) => role !== UserRoleEnum.SUPERADMIN,
        ),
      )
      .required(),
  )
  role!: UserRoleEnum;
}
