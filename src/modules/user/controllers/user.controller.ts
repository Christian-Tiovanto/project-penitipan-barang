import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTag } from '@app/enums/api-tags';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.USER)
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthenticateGuard)
  @ApiOperation({
    summary: 'Update User Password',
  })
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
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getUserById(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All User',
  })
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllUser() {
    return await this.userService.getAllUser();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User by id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
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
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.deleteUserById(userId);
  }
}
