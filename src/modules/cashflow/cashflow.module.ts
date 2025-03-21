import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cashflow } from './models/cashflow.entity';
import { CashflowController } from './controllers/cashflow.controller';
import { CashflowService } from './services/cashflow.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cashflow])],
  controllers: [CashflowController],
  providers: [CashflowService],
  exports: [CashflowService],
})
export class CashflowModule {}
