import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ArPayment } from '../models/ar-payment.entity';
import { CreateBulkArPaymentDto } from '../dtos/create-bulk-ar-payment.dto';
import { DATABASE_POOL } from '@app/modules/database/database.module';
import { Pool } from 'pg';
import { DATABASE } from '@app/enums/database-table';
interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class ArPaymentService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getAllArPayments({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[ArPayment[], number]> {
    const values = [];
    const getProductsSql = `
      SELECT *
      FROM ${DATABASE.AR_PAYMENT}
      LIMIT $1
      OFFSET $2
  `;
    const paginationCountSql = `
      SELECT count(*) as total_count
      FROM ${DATABASE.AR_PAYMENT}
    `;
    values.push(pageSize, (pageNo - 1) * pageSize);

    const { rows: arPaymentRows } = await this.pool.query<ArPayment>(
      getProductsSql,
      values,
    );
    const { rows: totalCountRows } = await this.pool.query<{
      total_count: string;
    }>(paginationCountSql);

    const totalCount = parseInt(totalCountRows[0].total_count, 10);

    return [arPaymentRows, totalCount];
  }

  async findArPaymentById(arPaymentId: number): Promise<ArPayment> {
    const sql = `
      SELECT *
      FROM ${DATABASE.AR_PAYMENT}
      WHERE id = $1
    `;
    const { rows } = await this.pool.query<ArPayment>(sql, [arPaymentId]);
    if (rows.length === 0) {
      throw new NotFoundException(
        `Acc Receivable Payment with id ${arPaymentId} not found`,
      );
    }
    return rows[0];
  }

  async createBulkArPayment(
    createBulkArPaymentDto: CreateBulkArPaymentDto,
  ): Promise<ArPayment[]> {
    const { payment_methodId, transfer_date, reference_no } =
      createBulkArPaymentDto;
    const { rows } = await this.pool.query<ArPayment>(
      'SELECT * FROM create_ar_payment($1, $2, $3, $4)',
      [
        JSON.stringify(createBulkArPaymentDto.data),
        payment_methodId,
        reference_no,
        transfer_date,
      ],
    );
    return rows;
  }
}
