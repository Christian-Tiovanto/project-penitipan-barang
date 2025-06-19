import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Product } from '../models/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { InsufficientStockException } from '@app/exceptions/validation.exception';
import { ProductSort } from '../classes/product.query';
import { SortOrder } from '@app/enums/sort-order';
import { GetProductResponse } from '../classes/product.response';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import {
  ProductsColumn,
  ProductUnitsColumn,
  TransactionInsColumn,
} from '@app/enums/table-column';

interface GetAllProductQuery {
  pageNo: number;
  pageSize: number;
  sort?: ProductSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
@Injectable()
export class ProductService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllProducts(): Promise<Product[]> {
    const sql = `
    SELECT ${DATABASE.PRODUCTS}.*, jsonb_agg(${DATABASE.PRODUCT_UNITS}.*) as product_unit 
    FROM ${DATABASE.PRODUCTS}
    LEFT JOIN ${DATABASE.PRODUCT_UNITS} ON ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.PRODUCT_ID} = ${DATABASE.PRODUCTS}.${ProductsColumn.ID}
    WHERE ${DATABASE.PRODUCTS}.${ProductsColumn.IS_DELETED} = FALSE
    GROUP BY ${DATABASE.PRODUCTS}.${ProductsColumn.ID}
    `;

    const { rows } = await this.pool.query<Product>(sql);
    return rows;
  }

  async getAllProductsPagination({
    pageNo,
    pageSize,
    search,
  }: GetAllProductQuery): Promise<[GetProductResponse[], number]> {
    const values: any[] = [];
    const whereConditions = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(${DATABASE.PRODUCTS}.${ProductsColumn.NAME} ILIKE $${paramIndex} OR ${DATABASE.PRODUCTS}.${ProductsColumn.DESC} ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const productColumnsToSelect = [
      ProductsColumn.ID,
      ProductsColumn.NAME,
      ProductsColumn.PRICE,
      ProductsColumn.QTY,
      ProductsColumn.DESC,
    ]
      .map((col) => `${DATABASE.PRODUCTS}.${col}`)
      .join(', ');

    const getProductsSql = `
              SELECT ${productColumnsToSelect}
              FROM ${DATABASE.PRODUCTS}
              ${whereClause}
              LIMIT $${paramIndex++}
              OFFSET $${paramIndex++}
            `;
    const paginationCountSql = `
              SELECT count(*) as total_count
              FROM ${DATABASE.PRODUCTS}
              ${whereClause}
              `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: productUnitRows } =
        await this.pool.query<GetProductResponse>(getProductsSql, values);
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(paginationCountSql, whereConditions.length != 0 ? [values[0]] : []);

      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [productUnitRows, totalCount];
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching users.',
      );
    }
  }

  async getProductById(productId: number): Promise<Product> {
    const sql = `
      SELECT *
      FROM ${DATABASE.PRODUCTS}
      WHERE ${ProductsColumn.ID} = $1 AND ${ProductsColumn.IS_DELETED} = FALSE
    `;
    const { rows } = await this.pool.query<Product>(sql, [productId]);
    return rows[0];
  }

  async findProductById(productId: number): Promise<Product> {
    const product = await this.getProductById(productId);
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
    const sql = `
    SELECT * FOR UPDATE
    FROM ${DATABASE.PRODUCTS}
    WHERE ${ProductsColumn.ID} = $1
    `;
    const { rows } = await this.pool.query<Product>(sql, [productId]);
    if (rows.length === 0) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    const product = rows[0];
    if (product.qty < requiredQty) {
      throw new InsufficientStockException(
        `Insufficient stock: ${product.name} required ${requiredQty}, but only ${product.qty} available in Stock`,
      );
    }

    return product;
  }

  async updateBulkProduct(product: Product[], entityManager: EntityManager) {
    await entityManager.save(product);
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const columns = Object.keys(createProductDto);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const values = columns.map((key) => createProductDto[key]);
    const sql = `
    INSERT INTO ${DATABASE.PRODUCTS} (${columns.join(', ')}) values (${placeholders})
    RETURNING *
    `;

    const { rows } = await this.pool.query<Product>(sql, values);
    return rows[0];
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const columnsToUpdate = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;

    for (const key of Object.keys(updateProductDto) as Array<
      keyof UpdateProductDto
    >) {
      const value = updateProductDto[key];

      if (value !== undefined) {
        columnsToUpdate.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }
    if (columnsToUpdate.length === 0) {
      throw new BadRequestException('The provided fields cannot be updated.');
    }
    const sql = `
    UPDATE ${DATABASE.PRODUCTS}
    SET ${columnsToUpdate.join(',')}
    WHERE ${ProductsColumn.ID} = $${paramIndex}
    RETURNING *
    `;
    const { rows } = await this.pool.query<Product>(sql, [
      ...values,
      productId,
    ]);
    if (rows.length === 0) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    return rows[0];
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
    const statusCheckSql = `
    SELECT
      EXISTS (
        SELECT 1 
        FROM ${DATABASE.TRANSACTION_INS} 
        WHERE ${DATABASE.TRANSACTION_INS}.${TransactionInsColumn.PRODUCT_ID} = products.id
      ) as hasTransactions
    FROM ${DATABASE.PRODUCTS}
    WHERE ${DATABASE.PRODUCTS}.id = $1 AND ${DATABASE.PRODUCTS}.${ProductsColumn.IS_DELETED} = false;
  `;
    const { rows } = await this.pool.query<{ hasTransactions: boolean }>(
      statusCheckSql,
      [productId],
    );

    const productStatus = rows[0];

    if (!productStatus) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (productStatus.hasTransactions) {
      throw new ConflictException(
        "Can't delete a Product that is already used in a Transaction In",
      );
    }
    const updateSql = `
    UPDATE products
    SET is_deleted = true
    WHERE id = $1
    RETURNING *;
  `;
    await this.pool.query(updateSql, [productId]);
  }
}
