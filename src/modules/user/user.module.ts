import { Global, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRoleService } from './services/user-role.service';
import { UserRoleController } from './controllers/user-role.controller';

@Global()
@Module({
  imports: [],
  providers: [UserService, UserRoleService],
  controllers: [UserController, UserRoleController],
  exports: [UserService, UserRoleService],
})
export class UserModule {}
