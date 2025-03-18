import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUnit } from '../models/product-unit.entity';
import { CreateProductUnitDto } from '../dtos/create-product-unit.dto';
import { UpdateProductUnitDto } from '../dtos/update-product-unit.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class ProductUnitService {
  constructor(
    @InjectRepository(ProductUnit)
    private readonly productUnitRepository: Repository<ProductUnit>,
  ) { }

  async getAllProductUnits({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[ProductUnit[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const products = await this.productUnitRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return products;
  }

  async getProductUnitById(productUnitId: number): Promise<ProductUnit> {
    return await this.productUnitRepository.findOne({ where: { id: productUnitId } });
  }

  async findProductUnitById(productUnitId: number): Promise<ProductUnit> {
    const productUnit = await this.productUnitRepository.findOne({
      where: { id: productUnitId },
    });

    if (!productUnit) {
      throw new NotFoundException(`Product with id ${productUnitId} not found`);
    }
    return productUnit;
  }

  async createProductUnit(createProductDto: CreateProductUnitDto): Promise<ProductUnit> {
    const newProductUnit = this.productUnitRepository.create(createProductDto);
    return await this.productUnitRepository.save(newProductUnit);
  }

  async updateProductUnit(
    productUnitId: number,
    updateProductDto: UpdateProductUnitDto,
  ): Promise<ProductUnit> {
    const productUnit = await this.findProductUnitById(productUnitId);

    Object.assign(productUnit, updateProductDto);

    return this.productUnitRepository.save(productUnit);
  }

  async deleteProductUnit(productUnitId: number): Promise<void> {
    await this.findProductUnitById(productUnitId);

    await this.productUnitRepository.delete(productUnitId);
  }
}
