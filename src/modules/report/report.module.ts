import { Module } from '@nestjs/common';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { TransactionInModule } from '../transaction-in/transaction-in.module';
import { TransactionOutModule } from '../transaction-out/transaction-out.module';
import { ProductModule } from '../product/product.module';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
  imports: [TransactionInModule, TransactionOutModule, ProductModule],
})
export class ReportModule {}
