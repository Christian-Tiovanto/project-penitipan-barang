import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnit } from './models/product-unit.entity';
import { ProductUnitController } from './controllers/product-unit.controller';
import { ProductUnitService } from './services/product-unit.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductUnit])],
  controllers: [ProductUnitController],
  providers: [ProductUnitService],
  exports: [ProductUnitService],
})
export class ProductUnitModule { }
