import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import { ProductsColumn, ProductUnitsColumn } from '@app/enums/table-column';
import { isPgError } from '@app/utils/pg-error-check';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
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
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllProductUnits(): Promise<ProductUnit[]> {
    const sql = `
      SELECT *
      FROM ${DATABASE.USERS}

    `;
    const { rows } = await this.pool.query<ProductUnit>(sql);
    return rows;
  }

  async getAllProductUnitsPagination({
    pageNo,
    pageSize,
    sort,
    order,
    search,
  }: GetAllProductUnitQuery): Promise<[GetProductUnitResponse[], number]> {
    const values: any[] = [];
    const productUnitAlias = 'pu';
    const productAlias = 'p';

    let sortBy: string = `${productUnitAlias}.${sort}`;
    if (sort === ProductUnitSort.PRODUCT) {
      sortBy = `${productAlias}.name`;
    }

    let paramIndex = 1;

    const whereConditions = [];
    if (search) {
      whereConditions.push(
        `(${productUnitAlias}.${ProductUnitsColumn.NAME} ILIKE $${paramIndex} OR ${productUnitAlias}.${ProductUnitsColumn.CONVERSION_TO_KG} ILIKE $${paramIndex} or ${productAlias}.${ProductsColumn.NAME} ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';
    const sortOrder = order === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;

    const productUnitColumnsToSelect = [
      ProductUnitsColumn.ID,
      ProductUnitsColumn.NAME,
      ProductUnitsColumn.CONVERSION_TO_KG,
    ]
      .map((col) => `${productUnitAlias}.${col}`)
      .join(', ');
    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `${productAlias}.${col}`)
      .join(', ');

    const sql = `
          SELECT ${productUnitColumnsToSelect}, jsonb_agg( ${productColumnsToSelect} ) as product
          FROM ${DATABASE.PRODUCT_UNITS} ${productUnitAlias}
          LEFT JOIN ${DATABASE.PRODUCTS} ${productAlias} on ${productUnitAlias}.${ProductUnitsColumn.ID} = ${productAlias}.${ProductsColumn.ID}
          ${whereClause}
          GROUP BY ${productUnitAlias}.${ProductUnitsColumn.ID}
          ORDER BY ${sortBy} ${sortOrder}
          LIMIT $${paramIndex++}
          OFFSET $${paramIndex++}
        `;
    const paginationCountSql = `
          SELECT count(*) as total_count
          FROM ${DATABASE.PRODUCT_UNITS} ${productUnitAlias}
          ${whereClause}
          `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: productUnitRows } =
        await this.pool.query<GetProductUnitResponse>(sql, values);
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(paginationCountSql);

      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [productUnitRows, totalCount];
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching users.',
      );
    }
  }

  async getProductUnitById(productUnitId: number): Promise<ProductUnit> {
    const sql = `
      SELECT ${DATABASE.PRODUCT_UNITS}.*, ${DATABASE.PRODUCTS}.*
      FROM ${DATABASE.PRODUCT_UNITS}
      LEFT JOIN ${DATABASE.PRODUCTS} ON ${DATABASE.PRODUCTS}.${ProductsColumn.ID} = ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.PRODUCT_ID}
      WHERE ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.ID} = $1
    `;
    const { rows } = await this.pool.query<ProductUnit>(sql, [productUnitId]);
    return rows[0];
  }

  async findProductUnitById(productUnitId: number): Promise<ProductUnit> {
    const productUnit = await this.getProductUnitById(productUnitId);

    if (!productUnit) {
      throw new NotFoundException(`Product with id ${productUnitId} not found`);
    }
    return productUnit;
  }
  async findProductUnitByIdNProductId(
    productUnitId: number,
    productId: number,
  ): Promise<ProductUnit> {
    const sql = `
      SELECT *
      FROM ${DATABASE.PRODUCT_UNITS}
      WHERE ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.ID} = $1 AND ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.PRODUCT_ID} = $2
    `;
    const { rows } = await this.pool.query<ProductUnit>(sql, [
      productUnitId,
      productId,
    ]);
    if (rows.length === 0) {
      throw new NotFoundException(
        `Product Unit with id ${productUnitId} not found`,
      );
    }
    return rows[0];
  }
  async getProductUnitProductId(
    productId: number,
  ): Promise<Pick<ProductUnit, 'id'>> {
    const sql = `
      SELECT ${ProductUnitsColumn.ID}
      FROM ${DATABASE.PRODUCT_UNITS}
      WHERE ${ProductUnitsColumn.PRODUCT_ID} = $1
    `;
    const { rows } = await this.pool.query<Pick<ProductUnit, 'id'>>(sql, [
      productId,
    ]);
    return rows[0];
  }

  async createProductUnit(
    createProductUnitDto: CreateProductUnitDto,
  ): Promise<ProductUnit> {
    const productUnit = await this.getProductUnitProductId(
      createProductUnitDto.productId,
    );
    if (productUnit)
      throw new BadRequestException(
        `Product ${createProductUnitDto.productId} already has Product Unit`,
      );
    const columns = Object.keys(createProductUnitDto);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const values = columns.map((key) => createProductUnitDto[key]);
    const sql = `
    INSERT INTO ${DATABASE.PRODUCT_UNITS} (${columns.join(', ')}) values (${placeholders})
    RETURNING *
            `;

    const { rows } = await this.pool.query<ProductUnit>(sql, values);

    return rows[0];
  }

  // async updateProductUnit(
  //   productUnitId: number,
  //   updateProductDto: UpdateProductUnitDto,
  // ): Promise<ProductUnit> {
  //   const productUnit = await this.findProductUnitById(productUnitId);
  //   const transactionInExist = await this.transactionInRepository.findOne({
  //     where: { productId: productUnit.productId },
  //   });
  //   console.log(transactionInExist);
  //   if (transactionInExist)
  //     throw new BadRequestException(
  //       "Can't Update Product Unit that already been used for Transaction In",
  //     );
  //   Object.assign(productUnit, updateProductDto);

  //   return this.productUnitRepository.save(productUnit);
  // }

  // async deleteProductUnit(productUnitId: number): Promise<void> {
  //   await this.findProductUnitById(productUnitId);

  //   await this.productUnitRepository.delete(productUnitId);
  // }

  async getProductUnitsByProductId(productId: number) {
    const sql = `
    SELECT *
    FROM ${DATABASE.PRODUCT_UNITS}
    WHERE ${ProductUnitsColumn.PRODUCT_ID} = $1
   `;
    const { rows } = await this.pool.query(sql, [productId]);
    return rows[0];
  }
}
