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
import { TransactionInHeaderController } from './controllers/transaction-in-header.controller';
import { TransactionOut } from '../transaction-out/models/transaction-out.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionIn,
      TransactionInHeader,
      TransactionOut,
    ]),
    ProductModule,
    ProductUnitModule,
    CustomerModule,
  ],
  providers: [TransactionInService, TransactionInHeaderService],
  controllers: [TransactionInController, TransactionInHeaderController],
  exports: [TransactionInService, TransactionInHeaderService, TypeOrmModule],
})
export class TransactionInModule {}
