import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionIn } from '../models/transaction-in.entity';
import {
  Between,
  Brackets,
  EntityManager,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateTransactionInDto } from '../dtos/create-transaction-in.dto';
import { UpdateTransactionInDto } from '../dtos/update-transaction-in.dto';
import { ProductService } from '@app/modules/product/services/product.service';
import { ProductUnitService } from '@app/modules/product-unit/services/product-unit.service';
import { ProductUnit } from '@app/modules/product-unit/models/product-unit.entity';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { InsufficientStockException } from '@app/exceptions/validation.exception';
import {
  SortOrder,
  SortOrderQueryBuilder,
  TransactionInSort,
} from '@app/enums/sort-order';
import { GetTransactionInResponse } from '../classes/transaction-in.response';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { CreateBulkTransactionInDto } from '../dtos/create-bulk-transaction-in.dto';
import { TransactionInHeaderService } from './transaction-in-header.service';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
import { convertToUTC } from '@app/utils/date';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool, PoolClient } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import {
  CustomersColumn,
  ProductsColumn,
  ProductUnitsColumn,
  TransactionInHeaderColumn,
  TransactionInsColumn,
} from '@app/enums/table-column';
import { isPgError } from '@app/utils/pg-error-check';
import { ErrorCode } from '@app/enums/error-code';

interface GetAllTransactionInQuery {
  pageNo: number;
  pageSize: number;
  sort?: TransactionInSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

interface getTransactionForStockReportQuery {
  endDate: Date;
  customerId?: number;
}

@Injectable()
export class TransactionInService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private productService: ProductService,
    private productUnitService: ProductUnitService,
    private customerService: CustomerService,
    private transactionInHeaderService: TransactionInHeaderService,
  ) {}

  async createBulkTransactionIn(
    createBulkTransactionInDto: CreateBulkTransactionInDto,
  ): Promise<TransactionIn[]> {
    const { customerId, description } = createBulkTransactionInDto;
    let { transaction_date: transactionDate } = createBulkTransactionInDto;
    transactionDate = convertToUTC(transactionDate);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const customer = await this.customerService.findCustomerByIdNLock(
        client,
        customerId,
      );
      const transHeader =
        await this.transactionInHeaderService.createTransactionInHeader(
          client,
          customer,
          transactionDate,
          description,
        );
      const createdTransaction = await this.createTransNUpdateProduct(
        client,
        createBulkTransactionInDto,
        transHeader,
        customer,
        transactionDate,
      );
      await client.query('COMMIT');
      return createdTransaction;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(
        'Failed to create SUPERADMIN user, transaction rolled back.',
        e,
      );
      throw e;
    } finally {
      client.release();
    }
  }

  private async createTransNUpdateProduct(
    client: PoolClient,
    createBulkTransactionInDto: CreateBulkTransactionInDto,
    transactionHeader: TransactionInHeader,
    customer: Customer,
    transactionDate: Date,
  ): Promise<TransactionIn[]> {
    const unitIds = createBulkTransactionInDto.data.map((d) => d.unitId);
    const productIds = createBulkTransactionInDto.data.map((d) => d.productId);
    const qtys = createBulkTransactionInDto.data.map((d) => d.qty);
    const isCharges = createBulkTransactionInDto.data.map((d) => d.is_charge);

    const validationSql = `
      SELECT d.productunitid, d.productid
      FROM unnest($1::int[], $2::int[]) as d(productunitid, productid)
      LEFT JOIN ${DATABASE.PRODUCT_UNITS} as pu on pu.${ProductUnitsColumn.ID} = d.productunitid
      WHERE pu.${ProductUnitsColumn.ID} IS NULL or pu.${ProductUnitsColumn.PRODUCT_ID} != d.productid
    `;
    const { rows: validationResult } = await client.query<{
      productunitid: number;
      productid: number;
    }>(validationSql, [unitIds, productIds]);
    if (validationResult.length > 0) {
      const errorDetails = validationResult
        .map(
          (row) =>
            `[productUnitId: ${row.productunitid}, productId: ${row.productid}]`,
        )
        .join(', ');
      throw new BadRequestException(
        `Operation failed due to invalid items. Please check the following: ${errorDetails}`,
      );
    }
    const executionSql = `
      WITH input_data AS (
        SELECT
          u.unit_id, u.product_id, u.qty, u.is_charge
        FROM unnest($1::int[], $2::int[], $3::numeric[], $4::boolean[]) AS u(unit_id, product_id, qty, is_charge)
      ),
      
      ready_data AS (
        SELECT
          inp.product_id, inp.qty, inp.is_charge,
          pu.name AS unit_name,
          pu.conversion_to_kg,
          (inp.qty * pu.conversion_to_kg) AS converted_qty
        FROM input_data AS inp
        JOIN ${DATABASE.PRODUCT_UNITS} AS pu ON pu.id = inp.unit_id
        JOIN ${DATABASE.PRODUCTS} AS p ON p.id = inp.product_id -- This join is required for locking 'p'
        FOR UPDATE OF pu, p
      ),

      updated_products AS (
        UPDATE ${DATABASE.PRODUCTS} AS p
        SET ${ProductsColumn.QTY} = p.${ProductsColumn.QTY} + r.converted_qty
        FROM ready_data AS r
        WHERE p.id = r.product_id
        RETURNING p.id
      ),

      inserted_transactions AS (
        INSERT INTO ${DATABASE.TRANSACTION_INS} (
          productid, qty, is_charge, unit, conversion_to_kg, remaining_qty, converted_qty,
          customerid, transaction_in_headerid, created_at, updated_at
        )
        SELECT
          r.product_id, r.qty, r.is_charge, r.unit_name, r.conversion_to_kg,
          r.converted_qty, r.converted_qty,
          $5, -- customer_id
          ${transactionHeader.id},
          $6, -- created_at
          $6  -- updated_at
        FROM ready_data AS r
        RETURNING *
      )
      SELECT * FROM inserted_transactions;
    `;
    const params = [
      unitIds,
      productIds,
      qtys,
      isCharges,
      customer.id,
      transactionDate,
    ];

    const { rows } = await client.query<TransactionIn>(executionSql, params);
    return rows;
  }

  async getAllTransactionIn({
    pageNo,
    pageSize,
    sort,
    order,
    search,
    startDate,
    endDate,
  }: GetAllTransactionInQuery): Promise<[GetTransactionInResponse[], number]> {
    const values: any[] = [];
    const whereConditions = [];
    let paramIndex = 1;

    let sortBy: string = `ti.${sort}`;
    if (
      sort === TransactionInSort.CUSTOMER ||
      sort === TransactionInSort.PRODUCT
    ) {
      console.log(sort);
      sortBy = `${sort}.name`;
    }
    if (sort === TransactionInSort.TRANSACTION_IN_HEADER) {
      sortBy = `${sort}.code`;
    }

    if (startDate) {
      whereConditions.push(`ti.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`ti.created_at  < $${paramIndex++}`);
      values.push(endDate);
    }
    if (search) {
      whereConditions.push(
        `(product.name ILIKE $${paramIndex} OR customer.name ILIKE $${paramIndex} OR ${DATABASE.TRANSACTION_IN_HEADER}.code ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `'${col}', product.${col}`)
      .join(', ');
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', customer.${col}`)
      .join(', ');
    const transHeaderColumnsToSelect = [
      TransactionInHeaderColumn.ID,
      TransactionInHeaderColumn.CODE,
    ]
      .map((col) => `'${col}', ${DATABASE.TRANSACTION_IN_HEADER}.${col}`)
      .join(', ');

    const getTransInDetailSql = `
              SELECT ti.*, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${transHeaderColumnsToSelect}) )) -> 0 as transaction_in_header
              FROM ${DATABASE.TRANSACTION_INS} as ti
              LEFT JOIN ${DATABASE.CUSTOMERS} customer on ti.customerid = customer.id
              LEFT JOIN ${DATABASE.PRODUCTS} product on ti.productid = product.id
              LEFT JOIN ${DATABASE.TRANSACTION_IN_HEADER} on ti.transaction_in_headerId = transaction_in_header.id 
              ${whereClause}
              GROUP BY ti.id
              ORDER BY ${sortBy} ${order}
              LIMIT $${paramIndex++}
              OFFSET $${paramIndex++}
              `;

    const paginationCountSql = `
              SELECT count(*) as total_count
              FROM ${DATABASE.TRANSACTION_INS} ti
              LEFT JOIN ${DATABASE.CUSTOMERS} customer on ti.customerid = customer.id
              LEFT JOIN ${DATABASE.PRODUCTS} product on ti.productid = product.id
              LEFT JOIN ${DATABASE.TRANSACTION_IN_HEADER} on ti.transaction_in_headerId = ${DATABASE.TRANSACTION_IN_HEADER}.id 
              ${whereClause}
              `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: transDetailRows } =
        await this.pool.query<GetTransactionInResponse>(
          getTransInDetailSql,
          values,
        );
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(
        paginationCountSql,
        whereConditions.length != 0 ? values.slice(0, -2) : [],
      );
      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [transDetailRows, totalCount];
    } catch (error) {
      console.error('Failed to get all Transaction Ins:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // async getTransactionForStockReport({
  //   endDate,
  //   customerId,
  // }: getTransactionForStockReportQuery): Promise<
  //   {
  //     product_name: string;
  //     customer_name: string;
  //     customerId: number;
  //     productId: number;
  //     total_qty: number;
  //   }[]
  // > {
  //   // 1. First create the grouped subquery
  //   const groupedQuery = this.transactionInRepository
  //     .createQueryBuilder('transaction')
  //     .select([
  //       'transaction.customerId AS customerId',
  //       'transaction.productId AS productId',
  //       'SUM(transaction.converted_qty) AS total_qty',
  //     ])
  //     .groupBy('customerId, productId');
  //   if (customerId) {
  //     groupedQuery.andWhere('customerId = :customerId', { customerId });
  //   }
  //   if (endDate) {
  //     groupedQuery.andWhere({ created_at: LessThan(endDate) });
  //   }
  //   // // 2. Main query with joins
  //   const result = await this.transactionInRepository
  //     .createQueryBuilder()
  //     .select([
  //       'grouped.customerId',
  //       'customer.name',
  //       'grouped.productId',
  //       'product.name',
  //       'grouped.total_qty',
  //     ])
  //     .from(`(${groupedQuery.getQuery()})`, 'grouped')
  //     .setParameters(groupedQuery.getParameters()) // Important: Pass the parameters!
  //     // .leftJoin(Customer, 'customer', 'customer.id = grouped.customerId')
  //     // .leftJoin(Product, 'product', 'product.id = grouped.productId')
  //     .groupBy('grouped.customerId, grouped.productId')
  //     .getRawMany();

  //   return result;
  // }

  async findTransactionInById(transInId: number) {
    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `'${col}', p.${col}`)
      .join(', ');
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', c.${col}`)
      .join(', ');
    const sql = `
      SELECT ti.*, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer
      FROM ${DATABASE.TRANSACTION_INS} ti
      LEFT JOIN ${DATABASE.CUSTOMERS} c on c.id = ti.customerid
      LEFT JOIN ${DATABASE.PRODUCTS} p on p.id = ti.productid
      WHERE ti.id = $1
      GROUP BY ti.id 
    `;
    const { rows } = await this.pool.query(sql, [transInId]);
    if (rows.length === 0)
      throw new NotFoundException(
        `No Transaction In Found with id ${transInId}`,
      );
    return rows[0];
  }

  // async sumCustProductQty(
  //   productId: number,
  //   customerId: number,
  //   startDate: Date,
  // ) {
  //   const result: { sum?: string } = await this.transactionInRepository
  //     .createQueryBuilder('transaction')
  //     .select('SUM(transaction.converted_qty)', 'sum')
  //     .where('transaction.created_at < :startDate', { startDate })
  //     .andWhere('transaction.productId = :productId', { productId })
  //     .andWhere('transaction.customerId = :customerId', { customerId })
  //     .getRawOne();

  //   return parseFloat(result?.sum || '0');
  // }

  // async getTransactionInForStockBookReport(
  //   productId: number,
  //   customerId: number,
  //   startDate: Date,
  //   endDate: Date,
  // ) {
  //   const [transactionsIns, sumResult] = (await Promise.all([
  //     // First promise - returns TransactionIn[]
  //     this.transactionInRepository.find({
  //       where: {
  //         created_at: Between(startDate, endDate),
  //         productId,
  //         customerId,
  //       },
  //       order: {
  //         created_at: 'ASC',
  //       },
  //     }),

  //     // Second promise - explicitly typed
  //     this.transactionInRepository
  //       .createQueryBuilder()
  //       .select('SUM(converted_qty)', 'sum')
  //       .where({
  //         created_at: Between(startDate, endDate),
  //         productId,
  //         customerId,
  //       })
  //       .getRawOne(),
  //   ])) as [TransactionIn[], { sum: string } | undefined];

  //   return {
  //     transactionsIns,
  //     totalSum: parseFloat(sumResult?.sum || '0'),
  //   };
  // }

  // async lockingTransactionInById(
  //   entityManager: EntityManager,
  //   id: number,
  // ): Promise<TransactionIn> {
  //   const transactionIn = await this.findTransactionInById(id);

  //   await entityManager.findOne(TransactionIn, {
  //     where: { id },
  //     lock: { mode: 'pessimistic_write' },
  //   });

  //   return transactionIn;
  // }

  // async getTransactionInsWithRemainingQty(
  //   productId: number,
  //   customerId: number,
  //   requiredQty: number,
  // ) {
  //   const transactionIns = await this.transactionInRepository.find({
  //     where: { productId, customerId, remaining_qty: MoreThan(0) },
  //     order: { created_at: 'ASC' },
  //   });

  //   if (!transactionIns.length) {
  //     throw new NotFoundException(
  //       `No transactions In found for productId ${productId} and customerId ${customerId}`,
  //     );
  //   }
  //   const totalRemainingQty = transactionIns.reduce(
  //     (sum, tx) => sum + tx.remaining_qty,
  //     0,
  //   );
  //   if (totalRemainingQty < requiredQty) {
  //     throw new InsufficientStockException(
  //       `Insufficient stock: required ${requiredQty}, but only ${totalRemainingQty} available in Transaction In`,
  //     );
  //   }

  //   return transactionIns;
  // }

  async updateTransactionInByIdWithEM(
    transactionInId: number,
    updateTransactionInDto: UpdateTransactionInDto,
  ) {
    try {
      const sql = `SELECT * FROM update_transaction_n_product($1, $2, $3, $4)`;
      const { rows } = await this.pool.query(sql, [
        transactionInId,
        updateTransactionInDto.productId,
        updateTransactionInDto.unitId,
        updateTransactionInDto.qty,
      ]);
      return rows[0];
    } catch (err) {
      if (isPgError(err)) {
        if (err.code === ErrorCode.NOT_FOUND) {
          throw new NotFoundException(err.message);
        } else if (err.code === ErrorCode.CONFLICT) {
          throw new ConflictException(err.message);
        }
        throw new InternalServerErrorException(err.message);
      }
    }
  }

  // async withdrawRemainingQtyWithEntityManager(
  //   entityManager: EntityManager,
  //   transactionIn: TransactionIn,
  //   qtyWithdraw: number,
  // ): Promise<TransactionIn> {
  //   transactionIn.remaining_qty -= qtyWithdraw;
  //   return entityManager.save(transactionIn);
  // }

  async getAllTransactionInByProductId(
    { pageNo, pageSize }: GetAllTransactionInQuery,
    productId: number,
  ): Promise<[TransactionIn[], number]> {
    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `'${col}', p.${col}`)
      .join(', ');
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', c.${col}`)
      .join(', ');
    const sql = `
      SELECT ti.*, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer FROM
      ${DATABASE.TRANSACTION_INS} ti
      LEFT JOIN ${DATABASE.CUSTOMERS} c on c.id = ti.customerid
      LEFT JOIN ${DATABASE.PRODUCTS} p on p.id = ti.productid
      WHERE ti.productid = $1
      GROUP BY ti.id
      ORDER BY ti.created_at desc
      LIMIT $2
      OFFSET $3 
    `;
    const paginationCountSql = `
      SELECT count(*) as total_count FROM
      ${DATABASE.TRANSACTION_INS} ti
      LEFT JOIN ${DATABASE.CUSTOMERS} c on c.id = ti.customerid
      LEFT JOIN ${DATABASE.PRODUCTS} p on p.id = ti.productid
      WHERE ti.productid = $1
    `;
    const { rows } = await this.pool.query<TransactionIn>(sql, [
      productId,
      pageSize,
      (pageNo - 1) * pageSize,
    ]);
    const { rows: count } = await this.pool.query<{ total_count: string }>(
      paginationCountSql,
      [productId],
    );

    return [rows, parseInt(count[0].total_count)];
  }

  async getAllTransactionInByHeaderId(
    headerId: number,
    {
      pageNo,
      pageSize,
      sort,
      order,
      startDate,
      endDate,
      search,
    }: GetAllTransactionInQuery,
  ): Promise<[GetTransactionInResponse[], number]> {
    const values: any[] = [];
    let paramIndex = 1;
    const whereConditions = [`ti.transaction_in_headerid = $${paramIndex++}`];
    values.push(headerId);
    let sortBy: string = `ti.${sort}`;
    if (
      sort === TransactionInSort.CUSTOMER ||
      sort === TransactionInSort.PRODUCT
    ) {
      console.log(sort);
      sortBy = `${sort}.name`;
    }
    if (sort === TransactionInSort.TRANSACTION_IN_HEADER) {
      sortBy = `${sort}.code`;
    }

    if (startDate) {
      whereConditions.push(`ti.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`ti.created_at  < $${paramIndex++}`);
      values.push(endDate);
    }
    if (search) {
      whereConditions.push(
        `(product.name ILIKE $${paramIndex} OR customer.name ILIKE $${paramIndex} OR ti.unit ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `'${col}', product.${col}`)
      .join(', ');
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', customer.${col}`)
      .join(', ');
    const transHeaderColumnsToSelect = [
      TransactionInHeaderColumn.ID,
      TransactionInHeaderColumn.CODE,
    ]
      .map((col) => `'${col}', ${DATABASE.TRANSACTION_IN_HEADER}.${col}`)
      .join(', ');

    const getTransInDetailSql = `
              SELECT ti.*, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${transHeaderColumnsToSelect}) )) -> 0 as transaction_in_header
              FROM ${DATABASE.TRANSACTION_INS} as ti
              LEFT JOIN ${DATABASE.CUSTOMERS} customer on ti.customerid = customer.id
              LEFT JOIN ${DATABASE.PRODUCTS} product on ti.productid = product.id
              LEFT JOIN ${DATABASE.TRANSACTION_IN_HEADER} on ti.transaction_in_headerId = transaction_in_header.id 
              ${whereClause}
              GROUP BY ti.id
              ORDER BY ${sortBy} ${order}
              LIMIT $${paramIndex++}
              OFFSET $${paramIndex++}
              `;

    const paginationCountSql = `
              SELECT count(*) as total_count
              FROM ${DATABASE.TRANSACTION_INS} ti
              LEFT JOIN ${DATABASE.CUSTOMERS} customer on ti.customerid = customer.id
              LEFT JOIN ${DATABASE.PRODUCTS} product on ti.productid = product.id
              LEFT JOIN ${DATABASE.TRANSACTION_IN_HEADER} on ti.transaction_in_headerId = ${DATABASE.TRANSACTION_IN_HEADER}.id 
              ${whereClause}
              `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: transDetailRows } =
        await this.pool.query<GetTransactionInResponse>(
          getTransInDetailSql,
          values,
        );
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(
        paginationCountSql,
        whereConditions.length != 0 ? values.slice(0, -2) : [],
      );
      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [transDetailRows, totalCount];
    } catch (error) {
      console.error('Failed to get all Transaction Ins:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
