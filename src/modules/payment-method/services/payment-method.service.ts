import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod } from '../models/payment-method.entity';
import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import { GetPaymentMethodResponse } from '../classes/payment-method.response';
import { SortOrder } from '@app/enums/sort-order';
import { PaymentMethodSort } from '../classes/payment-method.query';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
import { PaymentMethodsColumn } from '@app/enums/table-column';

interface GetAllPaymentMethodQuery {
  pageNo: number;
  pageSize: number;
  sort?: PaymentMethodSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class PaymentMethodService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const sql = `
      SELECT *
      FROM ${DATABASE.PAYMENT_METHODS}
    `;
    const { rows } = await this.pool.query<PaymentMethod>(sql);
    return rows;
  }

  async getAllPaymentMethodsPagination({
    pageNo,
    pageSize,
    sort,
    order,
    search,
  }: GetAllPaymentMethodQuery): Promise<[GetPaymentMethodResponse[], number]> {
    const values: any[] = [];
    let paramIndex = 1;

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        `(${DATABASE.PAYMENT_METHODS}.${PaymentMethodsColumn.NAME} ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const sortOrder = order === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;

    const columnsToSelect = [
      PaymentMethodsColumn.ID,
      PaymentMethodsColumn.NAME,
    ].join(', ');

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const sql = `
         SELECT ${columnsToSelect}
         FROM ${DATABASE.PAYMENT_METHODS}
         ${whereClause}
         ORDER BY ${sort} ${sortOrder}
         LIMIT $${paramIndex++}
         OFFSET $${paramIndex++}
       `;
    const paginationCountSql = `
         SELECT count(*) as total_count
         FROM ${DATABASE.PAYMENT_METHODS}
         ${whereClause}
       `;

    values.push(pageSize, (pageNo - 1) * pageSize);
    const { rows: customerRows } = await this.pool.query<PaymentMethod>(
      sql,
      values,
    );
    const { rows: totalCountRows } = await this.pool.query<{
      total_count: string;
    }>(paginationCountSql, whereConditions.length != 0 ? [values[0]] : []);

    const totalCount = parseInt(totalCountRows[0].total_count, 10);

    return [customerRows, totalCount];
  }

  async getPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod> {
    const sql = `
      SELECT *
      FROM ${DATABASE.PAYMENT_METHODS}
      WHERE ${PaymentMethodsColumn.ID} = $1
    `;
    const { rows } = await this.pool.query<PaymentMethod>(sql, [
      paymentMethodId,
    ]);
    return rows[0];
  }

  async findPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod> {
    const paymentMethod = await this.getPaymentMethodById(paymentMethodId);

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment Method with id ${paymentMethodId} not found`,
      );
    }
    return paymentMethod;
  }

  async createPaymentMethod(
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const columns = Object.keys(createPaymentMethodDto);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const values = columns.map((key) => createPaymentMethodDto[key]);
    const sql = `
    INSERT INTO ${DATABASE.PAYMENT_METHODS} (${columns.join(', ')}) values (${placeholders})
    RETURNING *
    `;

    const { rows } = await this.pool.query<PaymentMethod>(sql, values);
    return rows[0];
  }

  async updatePaymentMethod(
    paymentMethodId: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const columnsToUpdate = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;

    for (const key of Object.keys(updatePaymentMethodDto) as Array<
      keyof UpdatePaymentMethodDto
    >) {
      const value = updatePaymentMethodDto[key];

      if (value !== undefined) {
        columnsToUpdate.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }
    if (columnsToUpdate.length === 0) {
      throw new BadRequestException('The provided fields cannot be updated.');
    }
    const sql = `
    UPDATE ${DATABASE.PAYMENT_METHODS}
    SET ${columnsToUpdate.join(',')}
    WHERE ${PaymentMethodsColumn.ID} = $${paramIndex}
    RETURNING *
    `;
    const { rows } = await this.pool.query<PaymentMethod>(sql, [
      ...values,
      paymentMethodId,
    ]);
    if (rows.length === 0) {
      throw new NotFoundException(
        `Payment Method with id ${paymentMethodId} not found`,
      );
    }
    return rows[0];
  }

  async deletePaymentMethod(paymentMethodId: number): Promise<void> {
    const sql = `
      DELETE FROM ${DATABASE.PAYMENT_METHODS}
      WHERE ${PaymentMethodsColumn.ID} = $1
      RETURNING *
    `;
    const { rows } = await this.pool.query(sql, [paymentMethodId]);
    if (rows.length === 0) {
      throw new NotFoundException(
        `Payment Method with id ${paymentMethodId} not found`,
      );
    }
  }
}
