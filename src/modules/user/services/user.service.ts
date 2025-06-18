import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../models/user';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserSort } from '../classes/user.query';
import { SortOrder } from '@app/enums/sort-order';
import { UserRoleEnum } from '@app/enums/user-role';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import { UserRolesColumn, UsersColumn } from '@app/enums/table-column';
import { isPgError } from '@app/utils/pg-error-check';

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
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    createUserDto['password'] = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const columns = Object.keys(createUserDto).filter(
      (key) => createUserDto[key] != null, // `!= null` checks for both undefined and null
    );

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const values = columns.map((key) => createUserDto[key]);
    const sql = `
      INSERT INTO ${DATABASE.USERS} (${columns.join(', ')}) values (${placeholders})
      RETURNING *
      `;

    try {
      const { rows } = await this.pool.query<User>(sql, values);

      createdUser = rows[0];
    } catch (err) {
      if (isPgError(err) && err.code === ErrorCode.DUPLICATE_ENTRY) {
        const duplicateValue = err.detail.match(RegexPatterns.DuplicateEntry);
        throw new ConflictException(
          `${duplicateValue[1]} with value ${duplicateValue[2]} already exist`,
        );
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
    const userColumnToSelect = [UsersColumn.ID, UsersColumn.FULLNAME]
      .map((column) => `${DATABASE.USERS}.${column}`)
      .join(', ');

    const sql = `
    SELECT ${userColumnToSelect}, jsonb_agg( ${DATABASE.USER_ROLES}.${UserRolesColumn.ROLE}) AS roles 
    FROM ${DATABASE.USERS}  
    LEFT JOIN ${DATABASE.USER_ROLES} on ${DATABASE.USERS}.${UsersColumn.ID} = ${DATABASE.USER_ROLES}.${UserRolesColumn.USER_ID} 
    WHERE ${DATABASE.USERS}.${UsersColumn.ID} = $1 and ${UsersColumn.IS_DELETED} = false 
    GROUP BY ${DATABASE.USERS}.${UsersColumn.ID};
    `;

    const { rows } = await this.pool.query<User>(sql, [id]);
    return rows[0];
  }

  async getAllUsers({
    pageNo,
    pageSize,
    sort,
    order,
    search,
  }: GetAllUserQuery): Promise<[User[], number]> {
    const values: any[] = [];
    let paramIndex = 1;

    const userAlias = 'u';
    const userRoleAlias = 'ur';

    const whereClauses = [
      `${userAlias}.${UsersColumn.IS_DELETED} = false`,
      ` ${userAlias}.${UsersColumn.ID} NOT IN ( 
        SELECT ${userRoleAlias}.${UserRolesColumn.USER_ID}
        FROM user_roles ${userRoleAlias}
        WHERE ${userRoleAlias}.${UserRolesColumn.ROLE} = '${UserRoleEnum.SUPERADMIN}'
    )`,
    ];

    if (search) {
      whereClauses.push(
        `(${userAlias}.email ILIKE $${paramIndex} OR ${userAlias}.fullname ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const sortableColumns = ['fullname', 'email'];
    const sortBy = sortableColumns.includes(sort)
      ? `${userAlias}.${sort}`
      : `${userAlias}.id`;

    const sortOrder = order === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;

    const columnsToSelect = Object.values(UsersColumn)
      .filter((col) => col !== UsersColumn.PASSWORD)
      .map((col) => `${userAlias}.${col}`)
      .join(', ');

    const sql = `
      SELECT ${columnsToSelect}
      FROM ${DATABASE.USERS} ${userAlias}
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;
    const paginationCountSql = `
      SELECT count(*) as total_count
      FROM ${DATABASE.USERS} ${userAlias}
      WHERE ${whereClauses.join(' AND ')}
    `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: usersRow } = await this.pool.query<User>(sql, values);
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(paginationCountSql);

      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [usersRow, totalCount];
    } catch (error) {
      // Log the detailed error for debugging purposes
      console.error('Failed to get all users:', error);
      // Throw a generic error to the client
      throw new InternalServerErrorException(
        'An error occurred while fetching users.',
      );
    }
  }

  async findUserById(userId: number) {
    const columnsToSelect = Object.values(UsersColumn)
      .map((col) => `${DATABASE.USERS}.${col}`)
      .join(', ');
    const sql = `
    SELECT ${columnsToSelect} 
    FROM ${DATABASE.USERS} 
    LEFT JOIN ${DATABASE.USER_ROLES} on ${DATABASE.USERS}.${UsersColumn.ID} = ${DATABASE.USER_ROLES}.${UserRolesColumn.USER_ID} 
    WHERE ${DATABASE.USERS}.${UsersColumn.ID} = $1 and ${DATABASE.USERS}.${UsersColumn.IS_DELETED} = false 
    `;

    const { rows } = await this.pool.query<User>(sql, [userId]);
    if (rows.length === 0)
      throw new NotFoundException(`User with ${userId} not found`);

    return rows[0];
  }

  async findUserByEmail(email: string) {
    const userColumnToSelect = [
      UsersColumn.ID,
      UsersColumn.FULLNAME,
      UsersColumn.PASSWORD,
    ]
      .map((column) => `${DATABASE.USERS}.${column}`)
      .join(', ');

    const sql = `
    SELECT ${userColumnToSelect} 
    FROM ${DATABASE.USERS} 
    WHERE ${UsersColumn.EMAIL} = $1 and ${UsersColumn.IS_DELETED} = false 
    `;

    const { rows } = await this.pool.query<User>(sql, [email]);
    if (rows.length === 0)
      throw new NotFoundException(`User with ${email} not found`);

    return rows[0];
  }

  async updateUserPassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = await this.findUserById(userId);
    const isMatch = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Old Password is incorrect');
    }
    const newPassword = await bcrypt.hash(updatePasswordDto.password, 10);
    const sql = `
      UPDATE ${DATABASE.USERS} SET ${UsersColumn.PASSWORD}=$1
      WHERE ${UsersColumn.ID} = $2
      RETURNING *
    `;
    const { rows } = await this.pool.query<User>(sql, [newPassword, userId]);
    const updatedUser = rows[0];
    delete updatedUser.password;
    return updatedUser;
  }

  async updateUserById(userId: number, updateUserDto: UpdateUserDto) {
    const columns = [];
    const values = [];
    let paramIndex = 1;
    for (const [key, value] of Object.entries(updateUserDto)) {
      columns.push(`${key}=$${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    if (columns.length === 0) {
      throw new BadRequestException('The provided fields cannot be updated.');
    }
    values.push(userId);
    const sql = `
      UPDATE ${DATABASE.USERS} SET ${columns.join(', ')}
      WHERE ${UsersColumn.ID} = $${paramIndex}
      RETURNING *
    `;
    const { rows } = await this.pool.query<User>(sql, values);
    if (rows.length === 0)
      throw new NotFoundException(`User with ${userId} not found`);
    const user = rows[0];
    delete user.password;
    return user;
  }

  async deleteUserById(userId: number) {
    const sql = `
      UPDATE ${DATABASE.USERS} SET ${UsersColumn.IS_DELETED} = TRUE
      WHERE ${UsersColumn.ID} = $1 AND ${UsersColumn.IS_DELETED} = FALSE
      RETURNING *
      `;
    const { rows } = await this.pool.query(sql, [userId]);

    if (rows.length === 0) {
      throw new NotFoundException(
        `User with ID ${userId} not found or already deleted.`,
      );
    }
  }
}
