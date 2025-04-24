// src/seeder/user.seeder.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '@app/modules/user/models/user';
import { UserService } from '@app/modules/user/services/user.service';
import { UserRoleEnum } from '@app/enums/user-role';
import { UserRoleService } from '@app/modules/user/services/user-role.service';
import { UserRole } from '@app/modules/user/models/user-role';

@Injectable()
export class UserSeeder {
  constructor(
    private dataSource: DataSource,
    private userService: UserService,
    private userRoleService: UserRoleService,
  ) {}

  async run() {
    const email: string = process.env.USER_EMAIL;
    const pass: string = process.env.USER_PASS;
    const pin: string = process.env.USER_PIN;
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

    return await this.dataSource.transaction(async (manager) => {
      // Use manager to get repository-scoped services
      const user = await manager.save(
        manager.create(User, {
          fullname: 'Admin',
          email: email,
          password: pass,
          pin: pin,
        }),
      );
      await manager.save(
        manager.create(UserRole, {
          userId: user.id,
          role: UserRoleEnum.SUPERADMIN,
        }),
      );

      return user;
    });
  }
}
