import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiTag } from '@app/enums/api-tags';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { UserRoleService } from '../services/user-role.service';
import { CreateUserRoleDto } from '../dtos/create-user-role.dto copy';
import { DeleteUserRoleDto } from '../dtos/delete-user-role.dto';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { UserRolePermission } from '@app/enums/permission';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';

@ApiTags(ApiTag.USER_ROLE)
@Controller('api/v1/user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @ApiBearerAuth()
  @PermissionsMetatada(UserRolePermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @ApiOperation({
    summary: 'Create User Role',
  })
  @Post()
  async createUserRole(@Body() createUserRoleDto: CreateUserRoleDto) {
    return await this.userRoleService.createUserRole(createUserRoleDto);
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Delete User Role by userId and role',
  // })
  // @PermissionsMetatada(UserRolePermission.DELETE)
  // @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  // @Delete()
  // async deleteUserRoleByUserId(@Body() deleteUserRoleDto: DeleteUserRoleDto) {
  //   return await this.userRoleService.deleteUserRoleByUserId(deleteUserRoleDto);
  // }
}
