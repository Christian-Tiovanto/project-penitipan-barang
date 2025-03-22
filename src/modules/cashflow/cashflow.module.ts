import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cashflow } from './models/cashflow.entity';
import { CashflowController } from './controllers/cashflow.controller';
import { CashflowService } from './services/cashflow.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cashflow]), UserModule],
  controllers: [CashflowController],
  providers: [CashflowService],
  exports: [CashflowService],
})
export class CashflowModule {}
