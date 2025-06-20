import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import {
  SortOrder,
  SortOrderQueryBuilder,
  TransactionInHeaderSort,
} from '@app/enums/sort-order';
import { UpdateTransactionInHeaderDto } from '../dtos/update-trans-in-header.dto';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { DATABASE } from '@app/enums/database-table';
import { TransactionInHeaderColumn } from '@app/enums/table-column';
import { PoolClient } from 'pg';
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
    // @InjectRepository(TransactionInHeader)
    // private transactionInHeaderRepository: Repository<TransactionInHeader>,
    private readonly customerService: CustomerService,
  ) {}

  // async createTransactionInHeader(
  //   client: PoolClient,
  //   customer: Customer,
  //   transactionDate: Date,
  //   description: string,
  // ): Promise<TransactionInHeader> {
  //   const sql = `
  //   WITH create_transin_header as (
  //     INSERT INTO ${DATABASE.TRANSACTION_IN_HEADER} (${(TransactionInHeaderColumn.CUSTOMER_ID, TransactionInHeaderColumn.DESC, TransactionInHeaderColumn.CREATED_AT, TransactionInHeaderColumn.UPDATED_AT)}) values ($1, $2, $3, $3) RETURNING ${TransactionInHeaderColumn.ID}
  //   )
  //   UPDATE ${DATABASE.TRANSACTION_IN_HEADER}
  //   SET ${TransactionInHeaderColumn.CODE} = '${customer.code}' || '-' || LPAD((SELECT id::text FROM create_transin_header), 5, '0')
  //   FROM create_transin_header
  //   WHERE ${TransactionInHeaderColumn.ID} = create_transin_header.${TransactionInHeaderColumn.ID}
  //   RETURNING *
  //   `;
  //   const { rows } = await client.query(sql, [
  //     customer.code,
  //     description,
  //     transactionDate,
  //   ]);
  //   return rows[0];
  // }

  // async getAllTransactionInHeader({
  //   pageNo,
  //   pageSize,
  //   sort,
  //   order,
  //   startDate,
  //   endDate,
  //   search,
  // }: GetAllTransactionInHeaderQuery) {
  //   const skip = (pageNo - 1) * pageSize;

  //   let sortBy: string = `transaction-header.${sort}`;
  //   if (sort === TransactionInHeaderSort.CUSTOMER) {
  //     sortBy = `${sort}.name`;
  //   }

  //   if (sort === TransactionInHeaderSort.IS_CHARGE) {
  //     sortBy = `transaction_in.${sort}`;
  //   }

  //   const queryBuilder = this.transactionInHeaderRepository
  //     .createQueryBuilder('transaction-header')
  //     .leftJoinAndSelect('transaction-header.customer', 'customer')
  //     .leftJoinAndSelect('transaction-header.transaction_in', 'transaction_in')
  //     .skip(skip)
  //     .take(pageSize)
  //     .select([
  //       'transaction-header',
  //       'transaction_in',
  //       'customer.name',
  //       'customer.id',
  //     ])
  //     .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

  //   // Conditionally add filters
  //   if (startDate) {
  //     queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
  //   }

  //   if (endDate) {
  //     queryBuilder.andWhere({ created_at: LessThan(endDate) });
  //   }

  //   if (search) {
  //     queryBuilder.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('customer.name LIKE :search', { search: `%${search}%` });
  //         qb.where('transaction-header.code LIKE :search', {
  //           search: `%${search}%`,
  //         });
  //       }),
  //     );
  //   }

  //   const [transactionsIns, count] = await queryBuilder.getManyAndCount();
  //   return [transactionsIns, count];
  // }

  // async findTransactionInHeaderById(id: number) {
  //   const transactionIn = await this.transactionInHeaderRepository.findOne({
  //     where: { id },
  //     relations: ['customer', 'transaction_in', 'transaction_in.product'],
  //   });
  //   if (!transactionIn)
  //     throw new NotFoundException('No Transaction In Header with that id');
  //   return transactionIn;
  // }

  // async getAllTransactionInHeadersByCustomerId(
  //   customerId: number,
  // ): Promise<TransactionInHeader[]> {
  //   return await this.transactionInHeaderRepository.find({
  //     where: { customerId },
  //   });
  // }

  // async updateTransactionInHeaderCustomerId(
  //   transactionHeaderId: number,
  //   customerId: number,
  //   entityManager: EntityManager,
  // ) {
  //   const transactionInHeader =
  //     await this.findTransactionInHeaderById(transactionHeaderId);
  //   transactionInHeader.customer.id = customerId;
  //   await entityManager.save(transactionInHeader);
  // }

  // async updateTransactionInHeader(
  //   transactionHeaderId: number,
  //   updateTransInHeaderDto: UpdateTransactionInHeaderDto,
  // ) {
  //   const transactionInHeader =
  //     await this.findTransactionInHeaderById(transactionHeaderId);
  //   Object.assign(transactionInHeader, updateTransInHeaderDto);
  //   if (updateTransInHeaderDto.customerId) {
  //     await this.customerService.findCustomerById(
  //       updateTransInHeaderDto.customerId,
  //     );
  //     transactionInHeader.customer.id = updateTransInHeaderDto.customerId;
  //     for (const transactionIn of transactionInHeader.transaction_in) {
  //       transactionIn.customerId = updateTransInHeaderDto.customerId;
  //     }
  //   }
  //   const transInHeader =
  //     await this.transactionInHeaderRepository.manager.transaction(
  //       async (entityManager: EntityManager) => {
  //         return await entityManager.save(transactionInHeader);
  //       },
  //     );
  //   return transInHeader;
  // }
}
