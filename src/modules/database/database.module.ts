import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pg from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

@Global() // Make the module globally available
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new pg.Pool({
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
        });
      },
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}
