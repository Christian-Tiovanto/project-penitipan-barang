import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantPayment } from './models/merchant-payment.entity';
import { MerchantPaymentController } from './controllers/merchant-payment.controller';
import { MerchantPaymentService } from './services/merchant-payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([MerchantPayment])],
  controllers: [MerchantPaymentController],
  providers: [MerchantPaymentService],
  exports: [MerchantPaymentService],
})
export class MerchantPaymentModule { }
