// src/seeder/user.seeder.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@app/modules/user/models/user';
import { UserService } from '@app/modules/user/services/user.service';
import { UserRole } from '@app/enums/user-role';

@Injectable()
export class UserSeeder {
  constructor(private userService: UserService) {}

  async run() {
    const email: string = process.env.USER_EMAIL;
    const pass: string = process.env.USER_PASS;
    const pin: string = process.env.USER_PIN;
    const existing = await this.userService.getUserByEmail(email);
    if (existing) {
      return;
    }
    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = this.userService.createUser({
      fullname: 'Admin',
      email: email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      pin: pin,
    });

    return user;
  }
}
