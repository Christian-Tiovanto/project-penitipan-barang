import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '../models/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomerSort } from '../classes/customer.query';
import { SortOrder } from '@app/enums/sort-order';
import { GetCustomerResponse } from '../classes/customer.response';
import { CustomersColumn, TransactionInsColumn } from '@app/enums/table-column';
import { DATABASE } from '@app/enums/database-table';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { isPgError } from '@app/utils/pg-error-check';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';

interface GetAllCustomerQuery {
  pageNo: number;
  pageSize: number;
  sort?: CustomerSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
@Injectable()
export class CustomerService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllCustomers(): Promise<Customer[]> {
    const sql = `
      SELECT *
      FROM ${DATABASE.CUSTOMERS}
      WHERE ${CustomersColumn.IS_DELETED} = false
    `;
    const { rows } = await this.pool.query<Customer>(sql);
    return rows;
  }

  async getAllCustomersPagination({
    pageNo,
    pageSize,
    sort,
    order,
    search,
  }: GetAllCustomerQuery): Promise<[GetCustomerResponse[], number]> {
    const values: any[] = [];
    let paramIndex = 1;

    const whereClauses = [`${CustomersColumn.IS_DELETED} = false`];

    if (search) {
      whereClauses.push(
        `(${DATABASE.CUSTOMERS}.${CustomersColumn.NAME} ILIKE $${paramIndex} OR ${DATABASE.CUSTOMERS}.${CustomersColumn.CODE} ILIKE $${paramIndex} OR ${DATABASE.CUSTOMERS}.${CustomersColumn.ADDRESS} ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const sortOrder = order === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;

    const columnsToSelect = [
      CustomersColumn.ID,
      CustomersColumn.NAME,
      CustomersColumn.ADDRESS,
      CustomersColumn.CODE,
    ].join(', ');

    const sql = `
      SELECT ${columnsToSelect}
      FROM ${DATABASE.CUSTOMERS}
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${sort} ${sortOrder}
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;
    const paginationCountSql = `
      SELECT count(*) as total_count
      FROM ${DATABASE.CUSTOMERS}
      WHERE ${whereClauses.join(' AND ')}
    `;

    values.push(pageSize, (pageNo - 1) * pageSize);
    console.log(sql);
    const { rows: customerRows } = await this.pool.query<Customer>(sql, values);
    const { rows: totalCountRows } = await this.pool.query<{
      total_count: string;
    }>(paginationCountSql, whereClauses.length != 0 ? [values[0]] : []);

    const totalCount = parseInt(totalCountRows[0].total_count, 10);

    return [customerRows, totalCount];
  }

  async getCustomerById(customerId: number): Promise<Customer> {
    const sql = `
      SELECT *
      FROM ${DATABASE.CUSTOMERS}
      WHERE ${CustomersColumn.ID} = $1 AND ${CustomersColumn.IS_DELETED} = false
    `;
    const { rows } = await this.pool.query<Customer>(sql, [customerId]);
    return rows[0];
  }

  async findCustomerById(customerId: number): Promise<Customer> {
    const customer = await this.getCustomerById(customerId);

    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    return customer;
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    const columns = Object.keys(createCustomerDto);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const values = columns.map((key) => createCustomerDto[key]);
    const sql = `
        INSERT INTO ${DATABASE.CUSTOMERS} (${columns.join(', ')}) values (${placeholders})
        RETURNING *
        `;

    try {
      const { rows } = await this.pool.query<Customer>(sql, values);
      return rows[0];
    } catch (err) {
      if (isPgError(err) && err.code === ErrorCode.DUPLICATE_ENTRY) {
        const duplicateValue = err.detail.match(RegexPatterns.DuplicateEntry);
        throw new ConflictException(
          `${duplicateValue[1]} with value ${duplicateValue[2]} already exist`,
        );
      }
    }
  }

  async updateCustomer(
    customerId: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const columns = [];
    const values = [];
    let paramIndex = 1;
    for (const [key, value] of Object.entries(updateCustomerDto)) {
      columns.push(`${key}=$${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    if (columns.length === 0) {
      throw new BadRequestException('The provided fields cannot be updated.');
    }
    values.push(customerId);
    const sql = `
      UPDATE ${DATABASE.CUSTOMERS} SET ${columns.join(', ')}
      WHERE ${CustomersColumn.ID} = $${paramIndex}
      RETURNING *
    `;
    try {
      const { rows } = await this.pool.query<Customer>(sql, values);
      if (rows.length === 0)
        throw new NotFoundException(`Customer with ${customerId} not found`);
      const customer = rows[0];
      return customer;
    } catch (err) {
      if (isPgError(err) && err.code === ErrorCode.DUPLICATE_ENTRY) {
        const duplicateValue = err.detail.match(RegexPatterns.DuplicateEntry);
        throw new ConflictException(
          `${duplicateValue[1]} with value ${duplicateValue[2]} already exist`,
        );
      }
    }
  }

  async deleteCustomer(customerId: number): Promise<void> {
    const statusCheckSql = `
        SELECT
          EXISTS (
            SELECT 1 
            FROM ${DATABASE.TRANSACTION_INS} 
            WHERE ${DATABASE.TRANSACTION_INS}.${TransactionInsColumn.PRODUCT_ID} = products.id
          ) as hasTransactions
        FROM ${DATABASE.CUSTOMERS}
        WHERE ${DATABASE.CUSTOMERS}.id = $1 AND ${DATABASE.CUSTOMERS}.${CustomersColumn.IS_DELETED} = false FOR UPDATE;
      `;
    const { rows } = await this.pool.query<{ hasTransactions: boolean }>(
      statusCheckSql,
      [customerId],
    );

    const customerStatus = rows[0];

    if (!customerStatus) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }

    if (customerStatus.hasTransactions) {
      throw new ConflictException(
        "Can't delete a Customer that is already used in a Transaction In",
      );
    }
    const updateSql = `
        UPDATE ${DATABASE.CUSTOMERS}
        SET is_deleted = true
        WHERE id = $1
        RETURNING *;
      `;
    await this.pool.query(updateSql, [customerId]);
  }
}
