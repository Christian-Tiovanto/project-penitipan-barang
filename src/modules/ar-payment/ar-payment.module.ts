import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArPayment } from './models/ar-payment.entity';
import { ProductUnitController } from './controllers/ar-payment.controller';
import { ArPaymentService } from './services/ar-payment.service';
import { CustomerPaymentModule } from '../customer-payment/customer-payment.module';
import { CashflowModule } from '../cashflow/cashflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArPayment]),
    CustomerPaymentModule,
    CashflowModule,
  ],
  controllers: [ProductUnitController],
  providers: [ArPaymentService],
  exports: [ArPaymentService],
})
export class ArPaymentModule {}
