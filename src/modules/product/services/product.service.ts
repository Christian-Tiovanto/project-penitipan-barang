import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../models/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async getAllProducts({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Product[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const products = await this.productRepository.findAndCount({
      skip,
      take: pageSize,
      where: { is_deleted: false }
    });
    return products;
  }

  async getProductById(productId: number): Promise<Product> {
    return await this.productRepository.findOne({ where: { id: productId, is_deleted: false } });
  }

  async findProductById(productId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId, is_deleted: false },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    return await this.productRepository.save(newProduct);
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findProductById(productId);

    Object.assign(product, updateProductDto);

    return this.productRepository.save(product);
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.findProductById(productId);

    await this.productRepository.update(productId, { is_deleted: true });
  }
}
