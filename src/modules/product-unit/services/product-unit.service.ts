import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductUnit } from '../models/product-unit.entity';
import { CreateProductUnitDto } from '../dtos/create-product-unit.dto';
import { UpdateProductUnitDto } from '../dtos/update-product-unit.dto';
import { ProductUnitSort } from '../classes/product-unit.query';
import { GetProductUnitResponse } from '../classes/product-unit.response';
import { SortOrder } from '@app/enums/sort-order';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import {
  ProductsColumn,
  ProductUnitsColumn,
  TransactionInsColumn,
} from '@app/enums/table-column';
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
      FROM ${DATABASE.PRODUCT_UNITS}

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
      sortBy = `${productUnitAlias}.name`;
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
      .map((col) => `'${col}', ${productAlias}.${col}`)
      .join(', ');

    const sql = `
          SELECT ${productUnitColumnsToSelect}, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product
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
      console.log(sql);
      const { rows: productUnitRows } =
        await this.pool.query<GetProductUnitResponse>(sql, values);
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(paginationCountSql);

      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [productUnitRows, totalCount];
    } catch (error) {
      console.error('Failed to get all product units:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching product units.',
      );
    }
  }

  async getProductUnitById(productUnitId: number): Promise<ProductUnit> {
    const sql = `
      SELECT ${DATABASE.PRODUCT_UNITS}.*, jsonb_agg(${DATABASE.PRODUCTS}.*) as product
      FROM ${DATABASE.PRODUCT_UNITS}
      LEFT JOIN ${DATABASE.PRODUCTS} ON ${DATABASE.PRODUCTS}.${ProductsColumn.ID} = ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.PRODUCT_ID}
      WHERE ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.ID} = $1
      GROUP BY ${DATABASE.PRODUCT_UNITS}.${ProductUnitsColumn.ID}
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

  async updateProductUnit(
    productUnitId: number,
    updateProductUnitDto: UpdateProductUnitDto,
  ): Promise<ProductUnit> {
    const columnsToUpdate = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;

    for (const key of Object.keys(updateProductUnitDto) as Array<
      keyof UpdateProductUnitDto
    >) {
      const value = updateProductUnitDto[key];

      if (value !== undefined) {
        columnsToUpdate.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }
    if (columnsToUpdate.length === 0) {
      throw new BadRequestException('The provided fields cannot be updated.');
    }
    const statusCheckSql = `
        SELECT
          EXISTS (
            SELECT 1 
            FROM ${DATABASE.TRANSACTION_INS} 
            WHERE ${DATABASE.TRANSACTION_INS}.${TransactionInsColumn.PRODUCT_ID} = ${DATABASE.PRODUCT_UNITS}.id
          ) as hasTransactions
        FROM ${DATABASE.PRODUCT_UNITS}
        WHERE ${DATABASE.PRODUCT_UNITS}.id = $${paramIndex++} FOR UPDATE;
      `;
    const { rows: productUnitCheck } = await this.pool.query<{
      hasTransactions: boolean;
    }>(statusCheckSql, [productUnitId]);

    const productUnitStatus = productUnitCheck[0];

    if (!productUnitStatus) {
      throw new NotFoundException(
        `Product Unit with id ${productUnitId} not found`,
      );
    }

    if (productUnitStatus.hasTransactions) {
      throw new ConflictException(
        "Can't delete a Product Unit that is already used in a Transaction In",
      );
    }
    const sql = `
      UPDATE ${DATABASE.PRODUCT_UNITS}
      SET ${columnsToUpdate.join(',')}
      WHERE ${ProductUnitsColumn.ID} = $1
      RETURNING *
    `;
    const { rows: updatedProductUnit } = await this.pool.query<ProductUnit>(
      sql,
      [...values, productUnitId],
    );
    return updatedProductUnit[0];
  }

  async deleteProductUnit(productUnitId: number): Promise<void> {
    await this.findProductUnitById(productUnitId);
    const sql = `
      DELETE FROM
      ${DATABASE.PRODUCT_UNITS}
      WHERE ${ProductUnitsColumn.ID} = $1
      RETURNING *
    `;
    const { rows } = await this.pool.query<ProductUnit>(sql, [productUnitId]);
    if (rows.length === 0) {
      throw new NotFoundException(`Product with id ${productUnitId} not found`);
    }
  }

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
