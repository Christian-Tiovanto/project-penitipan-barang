import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from '../models/app-settings.entity';
import { UpdateSecurityPinDto } from '../dtos/update-pin.dto';

@Injectable()
export class AppSettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly appSettingRepository: Repository<AppSetting>,
  ) {}

  async updateSecurityPin(
    updateSecurityPinDto: UpdateSecurityPinDto,
  ): Promise<AppSetting> {
    const security_pin = await this.appSettingRepository.findOneBy({
      setting_name: 'security_pin',
    });
    security_pin.setting_value = updateSecurityPinDto.setting_value;

    return this.appSettingRepository.save(security_pin);
  }

  async getSecurityPin() {
    const securityPin = await this.appSettingRepository.findOneBy({
      setting_name: 'security_pin',
    });
    return securityPin;
  }
}
