import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.services';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtTokenResponse } from '../classes/auth.class';
import { CreateUserDto } from 'src/modules/user/dtos/create-user.dto';
import { ApiTag } from '@app/enums/api-tags';
import { LoginDto } from '../dtos/login.dto';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { SuperAdminGuard } from '@app/guards/superadmin.guard';
import { UserPermission } from '@app/enums/permission';

@ApiTags(ApiTag.AUTH)
@Controller('api/v1/auth')
@ApiExtraModels(JwtTokenResponse)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthenticateGuard, IntermediateGuard, SuperAdminGuard)
  @PermissionsMetatada(UserPermission.CREATE)
  @ApiOperation({
    summary: 'Create a User',
  })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
