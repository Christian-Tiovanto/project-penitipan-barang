import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
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
    const transactionInHeader = await entityManager.save(TransactionInHeader, {
      customerId: customer.id,
    });

    transactionInHeader.code = `${customer.code}-${String(transactionInHeader.id).padStart(5, '0')}`;
    await entityManager.save(TransactionInHeader, transactionInHeader);
    return transactionInHeader;
  }
}
