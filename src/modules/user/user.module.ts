import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRole } from './models/user-role';
import { UserRoleService } from './services/user-role.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  providers: [UserService, UserRoleService],
  controllers: [UserController],
  exports: [UserService, UserRoleService],
})
export class UserModule {}
