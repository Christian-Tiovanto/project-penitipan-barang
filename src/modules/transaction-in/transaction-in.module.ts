import { Module } from '@nestjs/common';
import { TransactionInService } from './services/transaction-in.service';
import { TransactionInController } from './controllers/transaction-in.controller';
import { ProductModule } from '../product/product.module';
import { ProductUnitModule } from '../product-unit/product-unit.module';
import { CustomerModule } from '../customer/customer.module';
import { TransactionInHeaderService } from './services/transaction-in-header.service';
import { TransactionInHeaderController } from './controllers/transaction-in-header.controller';

@Module({
  imports: [ProductModule, ProductUnitModule, CustomerModule],
  providers: [TransactionInService, TransactionInHeaderService],
  controllers: [TransactionInController, TransactionInHeaderController],
  exports: [TransactionInService, TransactionInHeaderService],
})
export class TransactionInModule {}
