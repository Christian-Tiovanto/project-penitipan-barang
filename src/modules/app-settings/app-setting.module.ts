import { Module } from '@nestjs/common';
import { AppSettingController } from './controllers/app-setting.controller';
import { AppSettingsService } from './services/app-settings.service';

@Module({
  imports: [],
  controllers: [AppSettingController],
  providers: [AppSettingsService],
  exports: [AppSettingsService],
})
export class AppSettingsModule {}
