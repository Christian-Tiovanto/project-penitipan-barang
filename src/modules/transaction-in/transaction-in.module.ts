import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionIn } from './models/transaction-in.entity';
import { TransactionInService } from './services/transaction-in.service';
import { TransactionInController } from './controllers/transaction-in.controller';
import { MerchantModule } from '../merchant/merchant.module';
import { ProductModule } from '../product/product.module';
import { ProductUnitModule } from '../product-unit/product-unit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionIn]),
    MerchantModule,
    ProductModule,
    ProductUnitModule,
  ],
  providers: [TransactionInService],
  controllers: [TransactionInController],
  exports: [TransactionInService],
})
export class TransactionInModule {}
