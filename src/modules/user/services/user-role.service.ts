import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
import { CreateUserRoleDto } from '../dtos/create-user-role.dto copy';
import { UserRole } from '../models/user-role';
import { UserRoleEnum } from '@app/enums/user-role';
import { DeleteUserRoleDto } from '../dtos/delete-user-role.dto';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';

@Injectable()
export class UserRoleService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async createUserRole(
    createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRole> {
    let createdUserRole: UserRole;
    try {
      const columns = Object.keys(createUserRoleDto).filter(
        (key) => createUserRoleDto[key] != null, // `!= null` checks for both undefined and null
      );

      const placeholders = columns
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const values = columns.map((key) => createUserRoleDto[key]);
      const sql = `
                INSERT INTO ${DATABASE.USER_ROLES} (${columns.join(', ')}) values (${placeholders})
                RETURNING *
            `;

      const { rows } = await this.pool.query<UserRole>(sql, values);

      createdUserRole = rows[0];
    } catch (err) {
      const queryError = err as QueryFailedError & {
        driverError: { errno: ErrorCode; sqlMessage: string };
      };
      if (queryError.driverError.errno === ErrorCode.DUPLICATE_ENTRY) {
        const duplicateValue = new RegExp(RegexPatterns.DuplicateEntry).exec(
          queryError.driverError.sqlMessage,
        );
        throw new ConflictException(`${duplicateValue[1]} value already exist`);
      }
    }
    return createdUserRole;
  }

  async getUserRoleByUserId(userId: number) {
    const sql = `
        SELECT * FROM ${DATABASE.USER_ROLES} 
        WHERE userId = $1 
        `;

    const { rows } = await this.pool.query<UserRole>(sql, [userId]);

    return rows;
  }
  // async findUserRoleByUserIdNRole(userId: number, role: UserRoleEnum) {
  //   const userRole = await this.userRoleRepository.findOne({
  //     where: { userId, role },
  //   });

  //   if (!userRole) {
  //     throw new NotFoundException(
  //       `No User Role found with id ${userId} and role ${role}`,
  //     );
  //   }
  //   return userRole;
  // }
  // async getUserRoleByUserIdNRole(userId: number, role: UserRoleEnum) {
  //   const userRole = await this.userRoleRepository.findOne({
  //     where: { userId, role },
  //   });

  //   return userRole;
  // }
  // async deleteUserRoleByUserId(deleteUserRoleDto: DeleteUserRoleDto) {
  //   const user = await this.findUserRoleByUserIdNRole(
  //     deleteUserRoleDto.userId,
  //     deleteUserRoleDto.role,
  //   );

  //   await this.userRoleRepository.delete({ id: user.id });
  // }
}
