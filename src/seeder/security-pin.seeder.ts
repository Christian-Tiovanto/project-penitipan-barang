// src/seeder/user.seeder.ts
import { Inject, Injectable } from '@nestjs/common';
import { AppSettingsService } from '@app/modules/app-settings/services/app-settings.service';
import { AppSetting } from '@app/modules/app-settings/models/app-settings.entity';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import { AppSettingsColumn } from '@app/enums/table-column';

@Injectable()
export class SecurityPinSeeder {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private appSettingsService: AppSettingsService,
  ) {}

  async run() {
    const securityPin: string = process.env.SECURITY_PIN;
    const existing = await this.appSettingsService.getSecurityPin();
    if (existing) {
      return;
    }
    const sql = `
    INSERT INTO ${DATABASE.APP_SETTINGS} (${(AppSettingsColumn.SETTING_NAME, AppSettingsColumn.SETTING_VALUE)}) values ($1, $2) 
`;
    const values = ['security_pin', securityPin];

    await this.pool.query<AppSetting>(sql, values);
  }
}
