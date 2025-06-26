import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { TransactionOut } from '../models/transaction-out.entity';
import {
  CreateTransactionOutFifoWithSpbDto,
  CreateTransactionOutWithSpbDto,
} from '../dtos/create-transaction-out.dto';
import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { ProductService } from '@app/modules/product/services/product.service';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { TransactionInService } from '@app/modules/transaction-in/services/transaction-in.service';
import {
  convertToUTC,
  convertToWIB,
  isOutsideBusinessHours,
  isPastDays,
  pastDaysCount,
} from '@app/utils/date';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { CreateInvoiceDto } from '@app/modules/invoice/dtos/create-invoice.dto';
import { CreateSpbDto } from '@app/modules/spb/dtos/create-spb.dto';
import { CreateArDto } from '@app/modules/ar/dtos/create-ar.dto';
import { InvoiceService } from '@app/modules/invoice/services/invoice.service';
import { ArService } from '@app/modules/ar/services/ar.service';
import { SpbService } from '@app/modules/spb/services/spb.service';
import { ChargeService } from '@app/modules/charge/services/charge.service';
import { InvoiceStatus } from '@app/enums/invoice-status';
import { ArStatus } from '@app/enums/ar-status';
import { ChargeType } from '@app/enums/charge-type';
import { TransactionOutSort } from '../classes/transaction-out.query';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { GetTransactionOutResponse } from '../classes/transaction-out.response';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { TransactionInHeader } from '@app/modules/transaction-in/models/transaction-in-header.entity';
import { TransactionInHeaderService } from '@app/modules/transaction-in/services/transaction-in-header.service';
import {
  InsufficientStockException,
  InvalidDateRangeException,
} from '@app/exceptions/validation.exception';
import { ProductUnitService } from '@app/modules/product-unit/services/product-unit.service';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import {
  CustomersColumn,
  InvoicesColumn,
  ProductsColumn,
} from '@app/enums/table-column';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
  sort?: TransactionOutSort;
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
export class TransactionOutService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllTransactionOuts({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
  }: GetAllQuery): Promise<[GetTransactionOutResponse[], number]> {
    const values: any[] = [];
    const whereConditions = [];
    let paramIndex = 1;

    let sortBy: string = `trans_out.${sort}`;
    if (
      sort === TransactionOutSort.CUSTOMER ||
      sort === TransactionOutSort.PRODUCT
    ) {
      console.log(sort);
      sortBy = `MIN(${sort}.name)`;
    }
    if (sort === TransactionOutSort.INVOICE) {
      sortBy = `${sort}.invoice_no`;
    }

    if (startDate) {
      whereConditions.push(`trans_out.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`trans_out.created_at  < $${paramIndex++}`);
      values.push(endDate);
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
      InvoicesColumn.ID,
      InvoicesColumn.INVOICE_NO,
    ]
      .map((col) => `'${col}', ${DATABASE.INVOICES}.${col}`)
      .join(', ');

    const getTransInDetailSql = `
      SELECT trans_out.*, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${transHeaderColumnsToSelect}) )) -> 0 as transaction_in_header
      FROM ${DATABASE.TRANSACTION_OUTS} as trans_out
      LEFT JOIN ${DATABASE.CUSTOMERS} customer on trans_out.customerid = customer.id
      LEFT JOIN ${DATABASE.PRODUCTS} product on trans_out.productid = product.id
      LEFT JOIN ${DATABASE.INVOICES} on trans_out.invoiceid = invoices.id 
      ${whereClause}
      GROUP BY trans_out.id
      ORDER BY ${sortBy} ${order}
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
      `;

    const paginationCountSql = `
      SELECT count(*) as total_count
      FROM ${DATABASE.TRANSACTION_OUTS} as trans_out
      LEFT JOIN ${DATABASE.CUSTOMERS} customer on trans_out.customerid = customer.id
      LEFT JOIN ${DATABASE.PRODUCTS} product on trans_out.productid = product.id
      LEFT JOIN ${DATABASE.INVOICES} on trans_out.invoiceid = invoices.id 
      ${whereClause}
      `;
    console.log(getTransInDetailSql);
    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: transDetailRows } =
        await this.pool.query<GetTransactionOutResponse>(
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
      console.error('Failed to get all Transaction Outs:', error);
      throw new InternalServerErrorException(error.message);
    }
    // const skip = (pageNo - 1) * pageSize;
    // let sortBy: string = `transaction.${sort}`;
    // if (
    //   sort === TransactionOutSort.CUSTOMER ||
    //   sort === TransactionOutSort.PRODUCT
    // ) {
    //   sortBy = `${sort}.name`;
    // }
    // if (sort === TransactionOutSort.INVOICE) {
    //   sortBy = `${sort}.invoice_no`;
    // }
    // const queryBuilder = this.transactionOutRepository
    //   .createQueryBuilder('transaction')
    //   .leftJoinAndSelect('transaction.customer', 'customer')
    //   .leftJoinAndSelect('transaction.product', 'product')
    //   .leftJoinAndSelect('transaction.invoice', 'invoice')
    //   .skip(skip)
    //   .take(pageSize)
    //   .select([
    //     'transaction',
    //     'customer.name',
    //     'customer.id',
    //     'product.name',
    //     'product.id',
    //     'invoice.id',
    //     'invoice.invoice_no',
    //   ])
    //   .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);
    // // Conditionally add filters
    // if (startDate) {
    //   queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    // }
    // if (endDate) {
    //   queryBuilder.andWhere({ created_at: LessThan(endDate) });
    // }
    // const [transactionsOuts, count] = await queryBuilder.getManyAndCount();
    // console.log('transactionsOuts');
    // console.log(transactionsOuts);
    // const transactionOutResponse: GetTransactionOutResponse[] =
    //   transactionsOuts.map((transaction: GetTransactionOutResponse) => {
    //     return {
    //       id: transaction.id,
    //       product: {
    //         id: transaction.product?.id ?? 0,
    //         name: transaction?.product?.name ?? transaction.productName,
    //       },
    //       customer: {
    //         id: transaction.customer.id,
    //         name: transaction.customer.name,
    //       },
    //       invoice: {
    //         id: transaction.invoice.id,
    //         invoice_no: transaction.invoice.invoice_no,
    //       },
    //       converted_qty: transaction.converted_qty,
    //       is_charge: transaction.is_charge,
    //       total_days: transaction.total_days,
    //     };
    //   });
    // return [transactionOutResponse, count];
  }

  async findTransactionOutById(
    transactionOutId: number,
  ): Promise<TransactionOut> {
    const sql = `
      SELECT *
      FROM ${DATABASE.TRANSACTION_OUTS}
      WHERE id = $1
    `;
    const { rows } = await this.pool.query<TransactionOut>(sql, [
      transactionOutId,
    ]);
    if (rows.length === 0)
      throw new NotFoundException(
        `Transaction Out With ID ${transactionOutId} not found`,
      );
    return rows[0];
  }

  // async sumCustProductQty(
  //   productId: number,
  //   customerId: number,
  //   startDate: Date,
  // ) {
  //   const result: { sum?: string } = await this.transactionOutRepository
  //     .createQueryBuilder('transaction')
  //     .select('SUM(transaction.converted_qty)', 'sum')
  //     .where('transaction.created_at < :startDate', { startDate })
  //     .andWhere('transaction.productId = :productId', { productId })
  //     .andWhere('transaction.customerId = :customerId', { customerId })
  //     .getRawOne();

  //   return parseFloat(result?.sum || '0');
  // }

  // async getTransactionOutForStockBookReport(
  //   productId: number,
  //   customerId: number,
  //   startDate: Date,
  //   endDate: Date,
  // ) {
  //   const [transactionOuts, sumResult] = (await Promise.all([
  //     // First promise - returns TransactionIn[]
  //     this.transactionOutRepository.find({
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
  //     this.transactionOutRepository
  //       .createQueryBuilder()
  //       .select('SUM(converted_qty)', 'sum')
  //       .where({
  //         created_at: Between(startDate, endDate),
  //         productId,
  //         customerId,
  //       })
  //       .getRawOne(),
  //   ])) as [TransactionOut[], { sum: string } | undefined];

  //   return {
  //     transactionOuts,
  //     totalSum: parseFloat(sumResult?.sum || '0'),
  //   };
  // }

  // async findTransactionOutById(
  //   transactionOutId: number,
  // ): Promise<TransactionOut> {
  //   const transactionOut = await this.transactionOutRepository.findOne({
  //     where: { id: transactionOutId },
  //   });

  //   if (!transactionOut) {
  //     throw new NotFoundException(
  //       `Transaction Out with id ${transactionOutId} not found`,
  //     );
  //   }
  //   return transactionOut;
  // }

  // async updateTransactionOutNull(
  //   entityManager: EntityManager,
  //   invoiceId: number,
  //   spbId: number,
  // ): Promise<void> {
  //   await entityManager.update(
  //     TransactionOut,
  //     { invoiceId: IsNull(), spbId: IsNull() },
  //     { invoiceId, spbId },
  //   );
  //   return;
  // }

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
  //   const groupedQuery = this.transactionOutRepository
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
  //   const result = await this.transactionOutRepository
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
  //     .where('grouped.productId > 0')
  //     .groupBy('grouped.customerId, grouped.productId')
  //     .getRawMany();

  //   return result;
  // }

  async createTransactionOutFifo(
    createTransactionOutFifoWithSpbDto: CreateTransactionOutFifoWithSpbDto,
  ): Promise<any> {
    const sql = `SELECT * FROM create_trans_out($1, $2, $3, $4, $5);`;
    const { rows } = await this.pool.query(sql, [
      JSON.stringify(createTransactionOutFifoWithSpbDto.transaction_outs),
      JSON.stringify(
        createTransactionOutFifoWithSpbDto.transaction_outs_brg_luar,
      ),
      JSON.stringify(createTransactionOutFifoWithSpbDto.customerId),
      1,
      JSON.stringify(createTransactionOutFifoWithSpbDto.transaction_date),
    ]);
    return rows;
  }
  async previewTransactionOutFifo(
    createTransactionOutFifoWithSpbDto: CreateTransactionOutFifoWithSpbDto,
  ): Promise<any> {
    const sql = `SELECT * FROM preview_trans_out($1, $2, $3, $4, $5);`;
    const { rows } = await this.pool.query(sql, [
      JSON.stringify(createTransactionOutFifoWithSpbDto.transaction_outs),
      JSON.stringify(
        createTransactionOutFifoWithSpbDto.transaction_outs_brg_luar,
      ),
      JSON.stringify(createTransactionOutFifoWithSpbDto.customerId),
      1,
      JSON.stringify(createTransactionOutFifoWithSpbDto.transaction_date),
    ]);
    return rows;
  }

  // async updateTransactionOut(
  //   transactionOutId: number,
  //   updateTransactionOutDto: UpdateTransactionOutDto,
  // ): Promise<TransactionOut> {
  //   const transactionOut = await this.findTransactionOutById(transactionOutId);

  //   Object.assign(transactionOut, updateTransactionOutDto);

  //   return this.transactionOutRepository.save(transactionOut);
  // }

  async getTransactionOutsByInvoiceId(
    invoiceId: number,
  ): Promise<TransactionOut[]> {
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', c.${col}`)
      .join(', ');
    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `'${col}', p.${col}`)
      .join(', ');

    const sql = `
      SELECT tr_o.*, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product
      FROM ${DATABASE.TRANSACTION_OUTS} tr_o
      LEFT JOIN ${DATABASE.PRODUCTS} p on p.id = tr_o.productid
      LEFT JOIN ${DATABASE.CUSTOMERS} c on c.id = tr_o.customerid
      WHERE tr_o.invoiceid = $1 and tr_o.productid is not null
      GROUP BY tr_o.id 
    `;
    const { rows } = await this.pool.query<TransactionOut>(sql, [invoiceId]);

    if (rows.length === 0) {
      throw new NotFoundException(
        `Transaction Out with Invoice Id ${invoiceId} not found`,
      );
    }

    return rows;
  }

  async getTransactionOutsByInvoiceIdWithBrgLuar(
    invoiceId: number,
  ): Promise<TransactionOut[]> {
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', c.${col}`)
      .join(', ');
    const productColumnsToSelect = [ProductsColumn.ID, ProductsColumn.NAME]
      .map((col) => `'${col}', p.${col}`)
      .join(', ');

    const sql = `
      SELECT tr_o.*, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${productColumnsToSelect}) )) -> 0 as product
      FROM ${DATABASE.TRANSACTION_OUTS} tr_o
      LEFT JOIN ${DATABASE.PRODUCTS} p on p.id = tr_o.productid
      LEFT JOIN ${DATABASE.CUSTOMERS} c on c.id = tr_o.customerid
      WHERE tr_o.invoiceid = $1
      GROUP BY tr_o.id 
    `;
    const { rows } = await this.pool.query<TransactionOut>(sql, [invoiceId]);

    if (rows.length === 0) {
      throw new NotFoundException(
        `Transaction Out with Invoice Id ${invoiceId} not found`,
      );
    }

    return rows;
  }
}
