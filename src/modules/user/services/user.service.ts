import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/user';
import {
  Brackets,
  LessThan,
  MoreThanOrEqual,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserSort } from '../classes/user.query';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { GetUserResponse } from '../classes/user.response';
import { UserRoleEnum } from '@app/enums/user-role';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import { UserRolesColumn, UsersColumn } from '@app/enums/table-column';

interface GetAllUserQuery {
  pageNo: number;
  pageSize: number;
  sort?: UserSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    let createdUser: User;
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
      createUserDto['password'] = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      const columns = Object.keys(createUserDto).filter(
        (key) => createUserDto[key] != null, // `!= null` checks for both undefined and null
      );

      const placeholders = columns
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const values = columns.map((key) => createUserDto[key]);
      const sql = `
          INSERT INTO ${DATABASE.USERS} (${columns.join(', ')}) values (${placeholders})
          RETURNING *
      `;

      const { rows } = await this.pool.query<User>(sql, values);

      createdUser = rows[0];
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
    delete createdUser.password;
    return createdUser;
  }

  async getUserByEmail(email: string) {
    const sql = `
    SELECT ${[UsersColumn.ID, UsersColumn.FULLNAME, UsersColumn.PASSWORD].join(',')} 
    FROM ${DATABASE.USERS} 
    WHERE ${UsersColumn.EMAIL} = $1 and ${UsersColumn.IS_DELETED} = false 
    `;

    const { rows } = await this.pool.query<User>(sql, [email]);
    return rows[0];
  }

  async getUserById(id: number) {
    const sql = `
    SELECT ${(UsersColumn.ID, UsersColumn.FULLNAME, UsersColumn.PASSWORD)} 
    FROM ${DATABASE.USERS}  
    LEFT JOIN ${DATABASE.USER_ROLES} on ${UsersColumn.ID} = ${UserRolesColumn.USER_ID} 
    WHERE ${UsersColumn.ID} = $1 and ${UsersColumn.IS_DELETED} = false 
    `;

    const { rows } = await this.pool.query<User>(sql, [id]);
    return rows[0];
  }

  async getAllUsers({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllUserQuery): Promise<[User[], number]> {
    const values: any[] = [];
    let paramIndex = 1;

    // --- Define table aliases as constants ---
    const userAlias = 'u';
    const userRoleAlias = 'ur';

    // --- Building WHERE clauses dynamically ---
    const whereClauses = [
      `${userAlias}.${UsersColumn.IS_DELETED} = false`,
      `(${userRoleAlias}.${UserRolesColumn.ROLE} IS NULL OR ${userRoleAlias}.${UserRolesColumn.ROLE} != $${paramIndex++})`,
    ];
    values.push(UserRoleEnum.SUPERADMIN);

    if (startDate) {
      whereClauses.push(`${userAlias}.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereClauses.push(`${userAlias}.created_at < $${paramIndex++}`);
      values.push(endDate);
    }
    if (search) {
      // Corrected: use ILIKE for case-insensitive search and use the same parameter for both fields
      whereClauses.push(
        `(${userAlias}.email ILIKE $${paramIndex} OR ${userAlias}.fullname ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const sortableColumns = ['fullname', 'email', 'created_at'];
    const sortBy = sortableColumns.includes(sort)
      ? `${userAlias}.${sort}`
      : `${userAlias}.created_at`;

    const sortOrder = order === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;

    const columnsToSelect = Object.values(UsersColumn)
      .filter((col) => col !== UsersColumn.PASSWORD)
      .map((col) => `${userAlias}.${col}`)
      .join(', ');

    const sql = `
      SELECT ${columnsToSelect}, COUNT(*) OVER() as total_count
      FROM ${DATABASE.USERS} ${userAlias}
      LEFT JOIN ${DATABASE.USER_ROLES} ${userRoleAlias} ON ${userAlias}.${UsersColumn.ID} = ${userRoleAlias}.${UserRolesColumn.USER_ID}
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows } = await this.pool.query<{ total_count: string }>(
        sql,
        values,
      );

      if (rows.length === 0) {
        return [[], 0];
      }

      const totalCount = parseInt(rows[0].total_count, 10);

      // Remove the total_count property from the user objects before returning
      const users = rows.map(({ total_count, ...user }) => user as User);

      return [users, totalCount];
    } catch (error) {
      // Log the detailed error for debugging purposes
      console.error('Failed to get all users:', error);
      // Throw a generic error to the client
      throw new InternalServerErrorException(
        'An error occurred while fetching users.',
      );
    }
  }
  // async findUserById(id: number) {
  //   const user = await this.userRepository.findOne({
  //     where: { id, is_deleted: false },
  //     relations: ['user_role'],
  //   });
  //   if (!user) throw new NotFoundException('No user with that id');
  //   return user;
  // }

  // async findUserByEmail(email: string) {
  //   const user = await this.userRepository.findOne({
  //     where: { email, is_deleted: false },
  //     select: ['id', 'fullname', 'password'],
  //   });
  //   if (!user) throw new NotFoundException('No User with that Email');
  //   return user;
  // }

  // async updateUserPassword(
  //   userId: number,
  //   updatePasswordDto: UpdatePasswordDto,
  // ) {
  //   const user = await this.findUserById(userId);
  //   const isMatch = await bcrypt.compare(
  //     updatePasswordDto.oldPassword,
  //     user.password,
  //   );
  //   if (!isMatch) {
  //     throw new BadRequestException('Old Password is incorrect');
  //   }
  //   user.password = await bcrypt.hash(updatePasswordDto.password, 10);
  //   await this.userRepository.save(user);
  //   delete user.password;
  //   return user;
  // }

  // async updateUserById(userId: number, updateUserDto: UpdateUserDto) {
  //   const user = await this.findUserById(userId);
  //   Object.assign(user, updateUserDto);
  //   await this.userRepository.save(user);
  //   return user;
  // }

  // async deleteUserById(userId: number) {
  //   const user = await this.findUserById(userId);
  //   user.is_deleted = true;
  //   await this.userRepository.save(user);
  // }
}
