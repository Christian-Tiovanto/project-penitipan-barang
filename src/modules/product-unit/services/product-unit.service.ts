import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { ProductUnit } from '../models/product-unit.entity';
import { CreateProductUnitDto } from '../dtos/create-product-unit.dto';
import { UpdateProductUnitDto } from '../dtos/update-product-unit.dto';
import { ProductUnitSort } from '../classes/product-unit.query';
import { GetProductUnitResponse } from '../classes/product-unit.response';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
interface GetAllProductUnitQuery {
  pageNo: number;
  pageSize: number;
  sort?: ProductUnitSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
@Injectable()
export class ProductUnitService {
  constructor(
    @InjectRepository(ProductUnit)
    private readonly productUnitRepository: Repository<ProductUnit>,
    @InjectRepository(TransactionIn)
    private readonly transactionInRepository: Repository<TransactionIn>,
  ) {}

  async getAllProductUnits(): Promise<ProductUnit[]> {
    return await this.productUnitRepository.find();
  }

  // async getAllProductUnitsPagination({
  //   pageNo,
  //   pageSize,
  // }: GetAllQuery): Promise<[ProductUnit[], number]> {
  //   const skip = (pageNo - 1) * pageSize;
  //   const products = await this.productUnitRepository.findAndCount({
  //     skip,
  //     take: pageSize,
  //     relations: ['product'],
  //   });
  //   return products;
  // }

  async getAllProductUnitsPagination({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllProductUnitQuery): Promise<[GetProductUnitResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;

    let sortBy: string = `product_units.${sort}`;
    if (sort === ProductUnitSort.PRODUCT) {
      sortBy = `${sort}.name`;
    }
    const queryBuilder = this.productUnitRepository
      .createQueryBuilder('product_units')
      // .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('product_units.product', 'product')
      .skip(skip)
      .take(pageSize)
      .select([
        'product_units',
        // 'customer.name',
        // 'customer.id',
        'product.name',
        'product.id',
      ])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product_units.name LIKE :search', { search: `%${search}%` })
            .orWhere('product.name LIKE :search', { search: `%${search}%` })
            .orWhere('conversion_to_kg LIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const [productUnits, count] = await queryBuilder.getManyAndCount();
    const productUnitResponse: GetProductUnitResponse[] = productUnits.map(
      (productUnit: GetProductUnitResponse) => {
        return {
          id: productUnit.id,
          product: {
            id: productUnit.product.id,
            name: productUnit.product.name,
          },
          name: productUnit.name,
          conversion_to_kg: productUnit.conversion_to_kg,
        };
      },
    );
    return [productUnitResponse, count];
  }

  async getProductUnitById(productUnitId: number): Promise<ProductUnit> {
    return await this.productUnitRepository.findOne({
      where: { id: productUnitId },
      relations: ['product'],
    });
  }

  async findProductUnitById(productUnitId: number): Promise<ProductUnit> {
    const productUnit = await this.productUnitRepository.findOne({
      where: { id: productUnitId },
      relations: ['product'],
    });

    if (!productUnit) {
      throw new NotFoundException(`Product with id ${productUnitId} not found`);
    }
    return productUnit;
  }
  async findProductUnitByIdNProductId(
    productUnitId: number,
    productId: number,
  ): Promise<ProductUnit> {
    const productUnit = await this.productUnitRepository.findOne({
      where: { id: productUnitId, productId: productId },
    });
    if (!productUnit) {
      throw new NotFoundException(
        `Product Unit with id ${productUnitId} not found`,
      );
    }
    return productUnit;
  }
  async getProductUnitProductId(productId: number): Promise<ProductUnit> {
    const productUnit = await this.productUnitRepository.findOne({
      where: { productId: productId },
    });
    return productUnit;
  }

  async createProductUnit(
    createProductDto: CreateProductUnitDto,
  ): Promise<ProductUnit> {
    const productUnit = await this.getProductUnitProductId(
      createProductDto.productId,
    );
    if (productUnit)
      throw new BadRequestException(
        `Product ${createProductDto.productId} already has Product Unit`,
      );
    const newProductUnit = this.productUnitRepository.create(createProductDto);
    return await this.productUnitRepository.save(newProductUnit);
  }

  async updateProductUnit(
    productUnitId: number,
    updateProductDto: UpdateProductUnitDto,
  ): Promise<ProductUnit> {
    const productUnit = await this.findProductUnitById(productUnitId);
    const transactionInExist = await this.transactionInRepository.findOne({
      where: { productId: productUnit.productId },
    });
    console.log(transactionInExist);
    if (transactionInExist)
      throw new BadRequestException(
        "Can't Update Product Unit that already been used for Transaction In",
      );
    Object.assign(productUnit, updateProductDto);

    return this.productUnitRepository.save(productUnit);
  }

  async deleteProductUnit(productUnitId: number): Promise<void> {
    await this.findProductUnitById(productUnitId);

    await this.productUnitRepository.delete(productUnitId);
  }

  async getProductUnitsByProductId(productId: number) {
    return this.productUnitRepository.find({
      where: { productId },
    });
  }
}
