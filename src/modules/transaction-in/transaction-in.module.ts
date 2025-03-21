import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionIn } from './models/transaction-in.entity';
import { TransactionInService } from './services/transaction-in.service';
import { TransactionInController } from './controllers/transaction-in.controller';
import { ProductModule } from '../product/product.module';
import { ProductUnitModule } from '../product-unit/product-unit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionIn]),
    ProductModule,
    ProductUnitModule,
  ],
  providers: [TransactionInService],
  controllers: [TransactionInController],
  exports: [TransactionInService],
})
export class TransactionInModule {}
