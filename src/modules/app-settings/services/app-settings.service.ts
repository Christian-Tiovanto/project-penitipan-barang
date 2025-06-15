import { Inject, Injectable } from '@nestjs/common';
import { UpdateSecurityPinDto } from '../dtos/update-pin.dto';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { AppSetting } from '../models/app-settings.entity';
import { DATABASE } from '@app/enums/database-table';

@Injectable()
export class AppSettingsService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async updateSecurityPin(
    updateSecurityPinDto: UpdateSecurityPinDto,
  ): Promise<AppSetting> {
    const sql = `
    UPDATE ${DATABASE.APP_SETTINGS} 
    SET setting_value = $1 
    WHERE setting_name = 'security_pin' 
    RETURNING *
`;
    const values = [updateSecurityPinDto.setting_value];

    const { rows } = await this.pool.query<AppSetting>(sql, values);

    return rows[0];
  }

  async getSecurityPin() {
    const sql = `
    SELECT setting_value FROM ${DATABASE.APP_SETTINGS} 
    WHERE setting_name = 'security_pin' 
    `;

    const { rows } = await this.pool.query<AppSetting>(sql);
    return rows[0];
  }
}
