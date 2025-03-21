import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPayment } from './models/customer-payment.entity';
import { CustomerPaymentController } from './controllers/customer-payment.controller';
import { CustomerPaymentService } from './services/customer-payment.service';
import { CustomerModule } from '../customer/customer.module';
import { PaymentMethodModule } from '../payment-method/payment-method.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerPayment]),
    CustomerModule,
    PaymentMethodModule,
  ],
  controllers: [CustomerPaymentController],
  providers: [CustomerPaymentService],
  exports: [CustomerPaymentService],
})
export class CustomerPaymentModule {}
