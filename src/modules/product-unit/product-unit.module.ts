import { Module } from '@nestjs/common';
import { ProductUnitController } from './controllers/product-unit.controller';
import { ProductUnitService } from './services/product-unit.service';

@Module({
  imports: [],
  controllers: [ProductUnitController],
  providers: [ProductUnitService],
  exports: [ProductUnitService],
})
export class ProductUnitModule {}
