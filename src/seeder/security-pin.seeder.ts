// src/seeder/user.seeder.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppSettingsService } from '@app/modules/app-settings/services/app-settings.service';
import { AppSetting } from '@app/modules/app-settings/models/app-settings.entity';

@Injectable()
export class SecurityPinSeeder {
  constructor(
    private dataSource: DataSource,
    private appSettingsService: AppSettingsService,
  ) {}

  async run() {
    const securityPin: string = process.env.SECURITY_PIN;
    const existing = await this.appSettingsService.getSecurityPin();
    if (existing) {
      return;
    }

    return await this.dataSource.transaction(async (manager) => {
      // Use manager to get repository-scoped services
      const securityPinSetting = await manager.save(
        manager.create(AppSetting, {
          setting_name: 'security_pin',
          setting_value: securityPin,
        }),
      );

      return securityPinSetting;
    });
  }
}
