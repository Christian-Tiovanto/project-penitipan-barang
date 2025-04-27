import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTag } from '@app/enums/api-tags';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { GetAllUserQuery, UserSort } from '../classes/user.query';
import { GetUserResponse } from '../classes/user.response';
import { SortOrder } from '@app/enums/sort-order';
import { SuperAdminGuard } from '@app/guards/superadmin.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { UserPermission } from '@app/enums/permission';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.USER)
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User Password',
  })
  // @PermissionsMetatada(UserPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id/update-password')
  async updatePassword(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.userService.updateUserPassword(userId, updatePasswordDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get User by Id',
  })
  // @PermissionsMetatada(UserPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getUserById(userId);
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Get All User',
  // })
  // @UseGuards(AuthenticateGuard)
  // @UseInterceptors(OffsetPaginationInterceptor)
  // @Get()
  // async getAllUser(
  //   @Query()
  //   { page_no, page_size }: BasePaginationQuery,
  // ): Promise<OffsetPagination<User>> {
  //   const pageSize = parseInt(page_size) || 10;
  //   const pageNo = parseInt(page_no) || 1;
  //   const users = await this.userService.getAllUser({
  //     pageNo,
  //     pageSize,
  //   });
  //   return {
  //     data: users[0],
  //     totalCount: users[1],
  //     filteredCount: users[1],
  //   };
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All User',
  })
  @ApiOkResponse({ type: GetUserResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @PermissionsMetatada(UserPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllUser(
    @Query()
    {
      page_no,
      page_size,
      start_date,
      end_date,
      sort,
      order,
      search,
    }: GetAllUserQuery,
  ): Promise<OffsetPagination<GetUserResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? UserSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const users = await this.userService.getAllUser({
      pageNo,
      pageSize,
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      search,
    });
    return {
      data: users[0],
      totalCount: users[1],
      filteredCount: users[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User by id',
  })
  // @PermissionsMetatada(UserPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUserById(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete User by id',
  })
  @PermissionsMetatada(UserPermission.DELETE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, SuperAdminGuard)
  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.deleteUserById(userId);
  }
}
