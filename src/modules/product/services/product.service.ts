import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from '../models/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { InsufficientStockException } from '@app/exceptions/validation.exception';

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
      where: { is_deleted: false },
    });
    return products;
  }

  async getProductById(productId: number): Promise<Product> {
    return await this.productRepository.findOne({
      where: { id: productId, is_deleted: false },
    });
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

  async lockingProductById(entityManager: EntityManager, productId: number, requiredQty: number): Promise<Product> {
    const product = await this.findProductById(productId)

    await entityManager.findOne(Product, {
      where: { id: productId },
      lock: { mode: "pessimistic_write" },
    });

    if (product.qty < requiredQty) {
      throw new InsufficientStockException(`Insufficient stock: required ${requiredQty}, but only ${product.qty} available in Stock`);
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

  async addProductQtyWithEntityManager(
    entityManager: EntityManager,
    product: Product,
    qtyAdd: number,
  ): Promise<Product> {
    product.qty += qtyAdd;
    return entityManager.save(product);
  }

  async withdrawProductQtyWithEntityManager(
    entityManager: EntityManager,
    product: Product,
    qtyWithdraw: number,
  ): Promise<Product> {
    product.qty -= qtyWithdraw;
    return entityManager.save(product);
  }

  async updateProductQtyWithEntityManager(
    entityManager: EntityManager,
    product: Product,
  ): Promise<Product> {
    return entityManager.save(product);
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.findProductById(productId);

    await this.productRepository.update(productId, { is_deleted: true });
  }
}
