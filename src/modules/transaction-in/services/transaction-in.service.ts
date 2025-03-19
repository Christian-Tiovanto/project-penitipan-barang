import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionIn } from '../models/transaction-in.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateTransactionInDto } from '../dtos/create-transaction-in.dto';
import { UpdateTransactionInDto } from '../dtos/update-supplier.dto';
import { MerchantService } from '@app/modules/merchant/services/merchant.service';
import { ProductService } from '@app/modules/product/services/product.service';

interface GetAllSupplier {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class TransactionInService {
  constructor(
    @InjectRepository(TransactionIn)
    private transactionInRepository: Repository<TransactionIn>,
    private merchantService: MerchantService,
    private productService: ProductService,
  ) {}

  async createTransactionIn(
    createTransactionInDto: CreateTransactionInDto,
  ): Promise<TransactionIn> {
    await this.merchantService.findMerchantById(
      createTransactionInDto.merchant,
    );
    const transaction = await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const product = await this.productService.findProductById(
          createTransactionInDto.product,
        );
        createTransactionInDto.final_qty =
          createTransactionInDto.qty + product.qty;
        createTransactionInDto.remaining_qty = createTransactionInDto.qty;
        await this.productService.updateProductQtyWithEntityManager(
          entityManager,
          product,
          createTransactionInDto.qty,
        );
        const transactionIn = entityManager.create(
          TransactionIn,
          createTransactionInDto,
        );
        const createdTransactionIn = await entityManager.save(transactionIn);
        return createdTransactionIn;
      },
    );

    return transaction;
  }

  async getAllTransactionIn({ pageNo, pageSize }: GetAllSupplier) {
    const skip = (pageNo - 1) * pageSize;
    const transactions = await this.transactionInRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return transactions;
  }

  async findTransactionInById(id: number) {
    const transactionIn = await this.transactionInRepository.findOne({
      where: { id },
    });
    if (!transactionIn)
      throw new NotFoundException('No Transaction In with that id');
    return transactionIn;
  }

  async updateTransactionInById(
    transactionInId: number,
    updateTransactionInDto: UpdateTransactionInDto,
  ) {
    const transactionIn = await this.findTransactionInById(transactionInId);
    Object.assign(transactionIn, updateTransactionInDto);
    await this.transactionInRepository.save(transactionIn);
    return transactionIn;
  }
}
