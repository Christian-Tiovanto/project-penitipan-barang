import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArPayment } from './models/ar-payment.entity';
import { ProductUnitController } from './controllers/ar-payment.controller';
import { ArPaymentService } from './services/ar-payment.service';
import { CustomerPaymentModule } from '../customer-payment/customer-payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArPayment]), CustomerPaymentModule],
  controllers: [ProductUnitController],
  providers: [ArPaymentService],
  exports: [ArPaymentService],
})
export class ArPaymentModule {}
