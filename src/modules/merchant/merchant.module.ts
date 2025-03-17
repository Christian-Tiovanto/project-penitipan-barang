import { Module } from '@nestjs/common';
import { MerchantService } from './services/merchant.service';
import { MerchantController } from './controllers/merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './models/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant])],
  providers: [MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
