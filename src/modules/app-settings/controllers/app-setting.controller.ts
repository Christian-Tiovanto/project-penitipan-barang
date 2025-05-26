import { Controller, Patch, Body, UseGuards, Get } from '@nestjs/common';
import { AppSettingsService } from '../services/app-settings.service';
import { UpdateSecurityPinDto } from '../dtos/update-pin.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { AppSettingsPermission } from '@app/enums/permission';
import { AppSetting } from '../models/app-settings.entity';

@ApiTags(ApiTag.APP_SETTINGS)
@Controller('api/v1/app-settings')
export class AppSettingController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Security Pin',
  })
  @PermissionsMetatada(AppSettingsPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('security-pin')
  async getSecurityPin(): Promise<AppSetting> {
    return await this.appSettingsService.getSecurityPin();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Pin by Id',
  })
  @PermissionsMetatada(AppSettingsPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch('security-pin')
  async updateCharge(@Body() updateChargeDto: UpdateSecurityPinDto) {
    return await this.appSettingsService.updateSecurityPin(updateChargeDto);
  }
}
