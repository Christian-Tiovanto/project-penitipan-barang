import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRole } from './models/user-role';
import { UserRoleService } from './services/user-role.service';
import { UserRoleController } from './controllers/user-role.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  providers: [UserService, UserRoleService],
  controllers: [UserController, UserRoleController],
  exports: [UserService, UserRoleService],
})
export class UserModule {}
