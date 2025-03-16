import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTag } from '@app/enums/api-tags';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
// import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { UpdatePasswordDto } from '../dtos/update-password.dto';

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
}
