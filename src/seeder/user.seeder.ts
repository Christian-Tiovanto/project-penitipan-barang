// src/seeder/user.seeder.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '@app/modules/user/services/user.service';
import { UserRoleEnum } from '@app/enums/user-role';
import { UserRoleService } from '@app/modules/user/services/user-role.service';
import { DATABASE } from '@app/enums/database-table';
import { UserRolesColumn, UsersColumn } from '@app/enums/table-column';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserSeeder {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private userService: UserService,
    private userRoleService: UserRoleService,
  ) {}

  async run() {
    const email: string = process.env.USER_EMAIL;
    const pass: string = process.env.USER_PASS;
    const existing = await this.userService.getUserByEmail(email);
    if (existing) {
      const userRoleExisting =
        await this.userRoleService.getUserRoleByUserIdNRole(
          existing.id,
          UserRoleEnum.SUPERADMIN,
        );
      if (userRoleExisting) {
        return;
      }
      await this.userRoleService.createUserRole({
        userId: existing.id,
        role: UserRoleEnum.SUPERADMIN,
      });
      return;
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const userInsertSql = `
        INSERT INTO ${DATABASE.USERS} (${[UsersColumn.FULLNAME, UsersColumn.EMAIL, UsersColumn.PASSWORD].join(',')})
        VALUES ($1, $2, $3)
        RETURNING ${UsersColumn.ID};
      `;
      const userInsertResult = await client.query<{ id: string }>(
        userInsertSql,
        ['Admin', email, hashedPassword],
      );

      const newUserId = userInsertResult.rows[0].id;

      const userRoleInsertSql = `
        INSERT INTO ${DATABASE.USER_ROLES} (${[UserRolesColumn.USER_ID, UserRolesColumn.ROLE].join(',')})
        VALUES ($1, $2);
      `;
      await client.query(userRoleInsertSql, [
        newUserId,
        UserRoleEnum.SUPERADMIN,
      ]);

      await client.query('COMMIT');
      console.log('Successfully created SUPERADMIN user.');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(
        'Failed to create SUPERADMIN user, transaction rolled back.',
        e,
      );
      throw e;
    } finally {
      client.release();
    }
  }
}
