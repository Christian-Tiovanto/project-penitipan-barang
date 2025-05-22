import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArPayment } from './models/ar-payment.entity';
import { ArPaymentController } from './controllers/ar-payment.controller';
import { ArPaymentService } from './services/ar-payment.service';
import { CustomerPaymentModule } from '../customer-payment/customer-payment.module';
import { CashflowModule } from '../cashflow/cashflow.module';
import { ArModule } from '../ar/ar.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { PaymentMethodModule } from '../payment-method/payment-method.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArPayment]),
    CustomerPaymentModule,
    CashflowModule,
    ArModule,
    InvoiceModule,
    PaymentMethodModule,
  ],
  controllers: [ArPaymentController],
  providers: [ArPaymentService],
  exports: [ArPaymentService],
})
export class ArPaymentModule {}
