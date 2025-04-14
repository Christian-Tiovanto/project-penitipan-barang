import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  EntityManager,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Product } from '../models/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { InsufficientStockException } from '@app/exceptions/validation.exception';
import { ProductSort } from '../classes/product.query';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { GetProductResponse } from '../classes/product.response';

interface GetAllProductQuery {
  pageNo: number;
  pageSize: number;
  sort?: ProductSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({ where: { is_deleted: false } }); // Assuming using TypeORM
  }

  // async getAllProductsPagination({
  //   pageNo,
  //   pageSize,
  // }: GetAllQuery): Promise<[Product[], number]> {
  //   const skip = (pageNo - 1) * pageSize;
  //   const products = await this.productRepository.findAndCount({
  //     skip,
  //     take: pageSize,
  //     where: { is_deleted: false },
  //   });
  //   return products;
  // }

  async getAllProductsPagination({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllProductQuery): Promise<[GetProductResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;

    let sortBy: string = `product.${sort}`;
    // if (
    //   sort === UserSort.EMAIL ||
    //   sort === UserSort.FULLNAME ||
    //   sort === UserSort.PIN ||
    //   sort === UserSort.ROLE
    // ) {
    //   sortBy = `${sort}.name`;
    // }
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      // .leftJoinAndSelect('user.customer', 'customer')
      // .leftJoinAndSelect('user.product', 'product')
      .skip(skip)
      .take(pageSize)
      .select(['product'])
      .andWhere('is_deleted = :isDeleted', { isDeleted: false });

    //Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('name LIKE :search', { search: `%${search}%` })
            .orWhere('price LIKE :search', { search: `%${search}%` })
            .orWhere('qty LIKE :search', { search: `%${search}%` })
            .orWhere('product.desc LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [products, count] = await queryBuilder.getManyAndCount();
    const productResponse: GetProductResponse[] = products.map(
      (product: GetProductResponse) => {
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: product.qty,
          desc: product.desc,
        };
      },
    );
    return [productResponse, count];
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

  async lockingProductById(
    entityManager: EntityManager,
    productId: number,
    requiredQty: number,
  ): Promise<Product> {
    const product = await this.findProductById(productId);

    await entityManager.findOne(Product, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (product.qty < requiredQty) {
      throw new InsufficientStockException(
        `Insufficient stock: required ${requiredQty}, but only ${product.qty} available in Stock`,
      );
    }

    return product;
  }

  async updateBulkProduct(product: Product[], entityManager: EntityManager) {
    await entityManager.save(product);
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    createProductDto.initial_qty = createProductDto.qty;
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
