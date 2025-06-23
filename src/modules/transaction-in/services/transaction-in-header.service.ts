import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { SortOrder, TransactionInHeaderSort } from '@app/enums/sort-order';
import { UpdateTransactionInHeaderDto } from '../dtos/update-trans-in-header.dto';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { DATABASE } from '@app/enums/database-table';
import {
  CustomersColumn,
  TransactionInHeaderColumn,
  TransactionInsColumn,
} from '@app/enums/table-column';
import { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '@app/modules/database/database.module';
interface GetAllTransactionInHeaderQuery {
  pageNo: number;
  pageSize: number;
  sort?: TransactionInHeaderSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
@Injectable()
export class TransactionInHeaderService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly customerService: CustomerService,
  ) {}

  async createTransactionInHeader(
    client: PoolClient,
    customer: Customer,
    transactionDate: Date,
    description: string,
  ): Promise<TransactionInHeader> {
    const createTransHeaderSql = `
      INSERT INTO ${DATABASE.TRANSACTION_IN_HEADER} (${[TransactionInHeaderColumn.CUSTOMER_ID, TransactionInHeaderColumn.DESC, TransactionInHeaderColumn.CREATED_AT, TransactionInHeaderColumn.UPDATED_AT].join(', ')}) values ($1, $2, $3, $3) RETURNING ${TransactionInHeaderColumn.ID}
    `;
    console.log(createTransHeaderSql);
    const { rows: createdTransHeader } = await client.query<{ id: number }>(
      createTransHeaderSql,
      [customer.id, description, transactionDate],
    );
    const updateTransHeaderCodeSql = `
      UPDATE ${DATABASE.TRANSACTION_IN_HEADER}
      SET ${TransactionInHeaderColumn.CODE} = $1 || '-' || LPAD(${createdTransHeader[0].id}::text, 5, '0')
      WHERE ${TransactionInHeaderColumn.ID} = ${createdTransHeader[0].id}
      RETURNING *
    
    `;
    const { rows } = await client.query(updateTransHeaderCodeSql, [
      customer.code,
    ]);
    return rows[0];
  }

  async getAllTransactionInHeader({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllTransactionInHeaderQuery) {
    const values: any[] = [];
    let paramIndex = 1;
    const whereConditions = [];
    let sortBy: string = `th.${sort}`;
    if (sort === TransactionInHeaderSort.CUSTOMER) {
      sortBy = `MIN(${sort}.name)`;
    }
    if (sort === TransactionInHeaderSort.IS_CHARGE) {
      sortBy = `th.${sort}`;
    }

    if (startDate) {
      whereConditions.push(`th.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`th.created_at  < $${paramIndex++}`);
      values.push(endDate);
    }
    if (search) {
      whereConditions.push(
        `(customer.name ILIKE $${paramIndex} OR th.code ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', customer.${col}`)
      .join(', ');
    const transInColumnsToSelect = [TransactionInsColumn.ID]
      .map((col) => `'${col}', ti.${col}`)
      .join(', ');

    const getTransInDetailSql = `
      SELECT th.*, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${transInColumnsToSelect}) )) -> 0 as transaction_ins
      FROM ${DATABASE.TRANSACTION_IN_HEADER} as th
      LEFT JOIN ${DATABASE.CUSTOMERS} customer on th.customerid = customer.id
      LEFT JOIN ${DATABASE.TRANSACTION_INS} ti on ti.transaction_in_headerId = th.id 
      ${whereClause}
      GROUP BY th.id
      ORDER BY ${sortBy} ${order}
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
      `;

    const paginationCountSql = `
      SELECT count(*) as total_count
      FROM ${DATABASE.TRANSACTION_IN_HEADER} as th
      LEFT JOIN ${DATABASE.CUSTOMERS} customer on th.customerid = customer.id
      LEFT JOIN ${DATABASE.TRANSACTION_INS} ti on ti.transaction_in_headerId = th.id 
      ${whereClause}
                  `;

    values.push(pageSize, (pageNo - 1) * pageSize);

    try {
      const { rows: transDetailRows } =
        await this.pool.query<TransactionInHeader>(getTransInDetailSql, values);
      const { rows: totalCountRows } = await this.pool.query<{
        total_count: string;
      }>(
        paginationCountSql,
        whereConditions.length != 0 ? values.slice(0, -2) : [],
      );
      const totalCount = parseInt(totalCountRows[0].total_count, 10);

      return [transDetailRows, totalCount];
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw error;
    }
  }

  async findTransactionInHeaderById(id: number) {
    const customerColumnsToSelect = [CustomersColumn.ID, CustomersColumn.NAME]
      .map((col) => `'${col}', c.${col}`)
      .join(', ');
    const transInColumnsToSelect = [TransactionInsColumn.ID]
      .map((col) => `'${col}', ti.${col}`)
      .join(', ');

    const sql = `
      SELECT th.*, (jsonb_agg( jsonb_build_object (${customerColumnsToSelect}) )) -> 0 as customer, (jsonb_agg( jsonb_build_object (${transInColumnsToSelect}, 'product',jsonb_build_object('id',p.id,'name',p.name) ) )) -> 0 as transaction_ins
      FROM ${DATABASE.TRANSACTION_IN_HEADER} th
      LEFT JOIN ${DATABASE.CUSTOMERS} c on c.id = th.customerid
      LEFT JOIN ${DATABASE.TRANSACTION_INS} ti on ti.transaction_in_headerid = th.id
      LEFT JOIN ${DATABASE.PRODUCTS} p on p.id = ti.productid
      WHERE th.id = $1
      GROUP BY th.id
    `;
    const { rows } = await this.pool.query(sql, [id]);
    if (rows.length === 0)
      throw new NotFoundException('No Transaction In Header with that id');
    return rows;
  }

  async getAllTransactionInHeadersByCustomerId(
    customerId: number,
  ): Promise<TransactionInHeader[]> {
    const sql = `
      SELECT *
      FROM ${DATABASE.TRANSACTION_IN_HEADER}
      WHERE customerid = $1
    `;
    const { rows } = await this.pool.query<TransactionInHeader>(sql, [
      customerId,
    ]);
    return rows;
  }

  async updateTransactionInHeader(
    transactionHeaderId: number,
    updateTransInHeaderDto: UpdateTransactionInHeaderDto,
  ) {
    const transactionInHeader =
      await this.findTransactionInHeaderById(transactionHeaderId);
    Object.assign(transactionInHeader, updateTransInHeaderDto);
    const sql = `
        WITH update_trans_detail as (
          UPDATE transaction_ins ti
          SET customerid = $1::integer
          WHERE ti.transaction_in_headerid = $3 and $1::integer is not null
        )
        UPDATE transaction_in_header th
        SET customerid = coalesce($1,th.customerid), description = coalesce($2,th.description)
        WHERE th.id = $3
        RETURNING *;

      `;
    const { rows: updatedTransDetail } = await this.pool.query(sql, [
      updateTransInHeaderDto.customerId,
      updateTransInHeaderDto.description,
      transactionHeaderId,
    ]);
    return updatedTransDetail[0];
  }
}
