import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionIn } from './models/transaction-in.entity';
import { TransactionInService } from './services/transaction-in.service';
import { TransactionInController } from './controllers/transaction-in.controller';
import { ProductModule } from '../product/product.module';
import { ProductUnitModule } from '../product-unit/product-unit.module';
import { CustomerModule } from '../customer/customer.module';
import { TransactionInHeaderService } from './services/transaction-in-header.service';
import { TransactionInHeader } from './models/transaction-in-header.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionIn, TransactionInHeader]),
    ProductModule,
    ProductUnitModule,
    CustomerModule,
  ],
  providers: [TransactionInService, TransactionInHeaderService],
  controllers: [TransactionInController],
  exports: [TransactionInService, TypeOrmModule],
})
export class TransactionInModule {}
