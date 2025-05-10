import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnit } from './models/product-unit.entity';
import { ProductUnitController } from './controllers/product-unit.controller';
import { ProductUnitService } from './services/product-unit.service';
import { TransactionIn } from '../transaction-in/models/transaction-in.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductUnit, TransactionIn])],
  controllers: [ProductUnitController],
  providers: [ProductUnitService],
  exports: [ProductUnitService],
})
export class ProductUnitModule {}
