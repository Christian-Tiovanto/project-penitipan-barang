import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiTag } from '@app/enums/api-tags';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { UserRoleService } from '../services/user-role.service';
import { CreateUserRoleDto } from '../dtos/create-user-role.dto copy';
import { DeleteUserRoleDto } from '../dtos/delete-user-role.dto';

@ApiTags(ApiTag.USER_ROLE)
@Controller('api/v1/user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @ApiBearerAuth()
  @UseGuards(AuthenticateGuard)
  @ApiOperation({
    summary: 'Create User Role',
  })
  @Post()
  async createUserRole(@Body() createUserRoleDto: CreateUserRoleDto) {
    return await this.userRoleService.createUserRole(createUserRoleDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete User Role by userId and role',
  })
  @UseGuards(AuthenticateGuard)
  @Delete()
  async deleteUserRoleByUserId(@Body() deleteUserRoleDto: DeleteUserRoleDto) {
    return await this.userRoleService.deleteUserRoleByUserId(deleteUserRoleDto);
  }
}
