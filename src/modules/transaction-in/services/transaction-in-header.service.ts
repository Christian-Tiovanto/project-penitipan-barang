import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  EntityManager,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import {
  SortOrder,
  SortOrderQueryBuilder,
  TransactionInHeaderSort,
} from '@app/enums/sort-order';
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
    @InjectRepository(TransactionInHeader)
    private transactionInHeaderRepository: Repository<TransactionInHeader>,
  ) {}

  async createTransactionInHeader(
    customer: Customer,
    entityManager: EntityManager,
  ): Promise<TransactionInHeader> {
    const transactionInHeader = entityManager.create(TransactionInHeader, {
      customer: {
        id: customer.id,
      },
    });
    await entityManager.save(transactionInHeader);

    transactionInHeader.code = `${customer.code}-${String(transactionInHeader.id).padStart(5, '0')}`;
    await entityManager.save(TransactionInHeader, transactionInHeader);
    return transactionInHeader;
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
    const skip = (pageNo - 1) * pageSize;

    let sortBy: string = `transaction-header.${sort}`;
    if (sort === TransactionInHeaderSort.CUSTOMER) {
      sortBy = `${sort}.name`;
    }

    const queryBuilder = this.transactionInHeaderRepository
      .createQueryBuilder('transaction-header')
      .leftJoinAndSelect('transaction-header.customer', 'customer')
      .leftJoinAndSelect('transaction-header.transaction_in', 'transaction_in')
      .skip(skip)
      .take(pageSize)
      .select([
        'transaction-header',
        'transaction_in',
        'customer.name',
        'customer.id',
      ])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('customer.name LIKE :search', { search: `%${search}%` });
          qb.where('transaction-header.code LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const [transactionsIns, count] = await queryBuilder.getManyAndCount();
    return [transactionsIns, count];
  }

  async findTransactionInHeaderById(id: number) {
    const transactionIn = await this.transactionInHeaderRepository.findOne({
      where: { id },
      relations: ['customer', 'transaction_in', 'transaction_in.product'],
    });
    if (!transactionIn)
      throw new NotFoundException('No Transaction In Header with that id');
    return transactionIn;
  }

  async getAllTransactionInHeadersByCustomerId(
    customerId: number,
  ): Promise<TransactionInHeader[]> {
    return await this.transactionInHeaderRepository.find({
      where: { customerId },
    });
  }
}
