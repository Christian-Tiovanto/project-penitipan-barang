import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransactionIn, TransactionIn } from '../models/transaction-in.entity';
import {
  Between,
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
import { IProductUnit } from '@app/modules/product-unit/models/product-unit.entity';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { InsufficientStockException } from '@app/exceptions/validation.exception';
import { TransactionInSort } from '../classes/transaction-in.query';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { GetTransactionInResponse } from '../classes/transaction-in.response';

interface GetAllTransactionInQuery {
  pageNo: number;
  pageSize: number;
  sort?: TransactionInSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class TransactionInService {
  constructor(
    @InjectRepository(TransactionIn)
    private transactionInRepository: Repository<TransactionIn>,
    private productService: ProductService,
    private productUnitService: ProductUnitService,
    private customerService: CustomerService,
  ) {}

  async createTransactionIn(
    createTransactionInDto: CreateTransactionInDto,
  ): Promise<TransactionIn> {
    const product = await this.productService.findProductById(
      createTransactionInDto.productId,
    );
    const productUnit =
      await this.productUnitService.findProductUnitByIdNProductId(
        createTransactionInDto.unitId,
        createTransactionInDto.productId,
      );
    await this.customerService.findCustomerById(
      createTransactionInDto.customerId,
    );
    createTransactionInDto.remaining_qty =
      createTransactionInDto.qty * productUnit.conversion_to_kg;
    createTransactionInDto.converted_qty =
      createTransactionInDto.qty * productUnit.conversion_to_kg;
    createTransactionInDto.conversion_to_kg = productUnit.conversion_to_kg;
    createTransactionInDto.unit = productUnit.name;
    const transaction = await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        await this.productService.addProductQtyWithEntityManager(
          entityManager,
          product,
          createTransactionInDto.converted_qty,
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

  async getAllTransactionIn({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllTransactionInQuery): Promise<[GetTransactionInResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;
    let sortBy: string = `transaction.${sort}`;
    if (
      sort === TransactionInSort.CUSTOMER ||
      sort === TransactionInSort.PRODUCT
    ) {
      sortBy = `${sort}.name`;
    }
    const queryBuilder = this.transactionInRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('transaction.product', 'product')
      .skip(skip)
      .take(pageSize)
      .select([
        'transaction',
        'customer.name',
        'customer.id',
        'product.name',
        'product.id',
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
      queryBuilder.andWhere('customer.name LIKE :search', {
        search: `%${search}%`, // Add wildcards for partial matching
      });
    }
    const [transactionsIns, count] = await queryBuilder.getManyAndCount();
    const transactionInResponse: GetTransactionInResponse[] =
      transactionsIns.map((transaction: GetTransactionInResponse) => {
        return {
          id: transaction.id,
          product: {
            id: transaction.product.id,
            name: transaction.product.name,
          },
          customer: {
            id: transaction.customer.id,
            name: transaction.customer.name,
          },
          qty: transaction.qty,
          converted_qty: transaction.qty,
          unit: transaction.unit,
        };
      });
    return [transactionInResponse, count];
  }

  async findTransactionInById(id: number) {
    const transactionIn = await this.transactionInRepository.findOne({
      where: { id },
    });
    if (!transactionIn)
      throw new NotFoundException('No Transaction In with that id');
    return transactionIn;
  }
  async sumCustProductQty(
    productId: number,
    customerId: number,
    startDate: Date,
  ) {
    const result: { sum?: string } = await this.transactionInRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.converted_qty)', 'sum')
      .where('transaction.created_at < :startDate', { startDate })
      .andWhere('transaction.productId = :productId', { productId })
      .andWhere('transaction.customerId = :customerId', { customerId })
      .getRawOne();

    return parseFloat(result?.sum || '0');
  }
  async getTransactionInForStockBookReport(
    productId: number,
    customerId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const [transactionsIns, sumResult] = (await Promise.all([
      // First promise - returns TransactionIn[]
      this.transactionInRepository.find({
        where: {
          created_at: Between(startDate, endDate),
          productId,
          customerId,
        },
        order: {
          created_at: 'ASC',
        },
      }),

      // Second promise - explicitly typed
      this.transactionInRepository
        .createQueryBuilder()
        .select('SUM(converted_qty)', 'sum')
        .where({
          created_at: Between(startDate, endDate),
          productId,
          customerId,
        })
        .getRawOne(),
    ])) as [TransactionIn[], { sum: string } | undefined];

    return {
      transactionsIns,
      totalSum: parseFloat(sumResult?.sum || '0'),
    };
  }

  async lockingTransactionInById(
    entityManager: EntityManager,
    id: number,
  ): Promise<TransactionIn> {
    const transactionIn = await this.findTransactionInById(id);

    await entityManager.findOne(TransactionIn, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    return transactionIn;
  }

  async getTransactionInsWithRemainingQty(
    productId: number,
    customerId: number,
    requiredQty: number,
  ) {
    const transactionIns = await this.transactionInRepository.find({
      where: { productId, customerId, remaining_qty: MoreThan(0) },
      order: { created_at: 'ASC' },
    });
    if (!transactionIns.length) {
      throw new NotFoundException(
        `No transactions In found for productId ${productId} and customerId ${customerId}`,
      );
    }
    const totalRemainingQty = transactionIns.reduce(
      (sum, tx) => sum + tx.remaining_qty,
      0,
    );
    if (totalRemainingQty < requiredQty) {
      throw new InsufficientStockException(
        `Insufficient stock: required ${requiredQty}, but only ${totalRemainingQty} available in Transaction In`,
      );
    }

    return transactionIns;
  }

  async updateTransactionInByIdWithEM(
    transactionInId: number,
    updateTransactionInDto: UpdateTransactionInDto,
  ) {
    const transactionIn = await this.findTransactionInById(transactionInId);
    await this.customerService.findCustomerById(
      updateTransactionInDto.customerId,
    );
    let currentProductUnit: Pick<IProductUnit, 'conversion_to_kg' | 'name'> = {
      conversion_to_kg: transactionIn.conversion_to_kg,
      name: transactionIn.unit,
    };
    const currentQty: Pick<ITransactionIn, 'qty'> = {
      qty: transactionIn.qty,
    };
    if (!updateTransactionInDto.productId) {
      updateTransactionInDto.productId = transactionIn.productId;
    }
    if (updateTransactionInDto.unitId) {
      currentProductUnit =
        await this.productUnitService.findProductUnitByIdNProductId(
          updateTransactionInDto.unitId,
          updateTransactionInDto.productId,
        );
      updateTransactionInDto.unit = currentProductUnit.name;
      updateTransactionInDto.conversion_to_kg =
        currentProductUnit.conversion_to_kg;
    }
    if (updateTransactionInDto.qty) {
      currentQty.qty = updateTransactionInDto.qty;
    }
    updateTransactionInDto.converted_qty =
      currentQty.qty * currentProductUnit.conversion_to_kg;
    await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        await this.updateTransactionInProduct(
          transactionIn,
          updateTransactionInDto,
          entityManager,
        );

        updateTransactionInDto.remaining_qty =
          updateTransactionInDto.converted_qty;
        Object.assign(transactionIn, updateTransactionInDto);
        await entityManager.save(transactionIn);
      },
    );
    return transactionIn;
  }

  private async updateTransactionInProductQty(
    transactionIn: TransactionIn,
    updateTransactionInDto: UpdateTransactionInDto,
    entityManager: EntityManager,
  ) {
    const product = await this.productService.findProductById(
      transactionIn.productId,
    );
    const qtyToUpdate =
      transactionIn.converted_qty - updateTransactionInDto.converted_qty;
    product.qty = product.qty - qtyToUpdate;
    await this.productService.updateProductQtyWithEntityManager(
      entityManager,
      product,
    );
  }

  async withdrawRemainingQtyWithEntityManager(
    entityManager: EntityManager,
    transactionIn: TransactionIn,
    qtyWithdraw: number,
  ): Promise<TransactionIn> {
    transactionIn.remaining_qty -= qtyWithdraw;
    return entityManager.save(transactionIn);
  }

  private async updateTransactionInProduct(
    transactionIn: TransactionIn,
    updateTransactionInDto: UpdateTransactionInDto,
    entityManager: EntityManager,
  ) {
    if (transactionIn.productId === updateTransactionInDto.productId) {
      await this.updateTransactionInProductQty(
        transactionIn,
        updateTransactionInDto,
        entityManager,
      );
    } else {
      const previousProduct = await this.productService.findProductById(
        transactionIn.productId,
      );
      previousProduct.qty = previousProduct.qty - transactionIn.converted_qty;
      await this.productService.updateProductQtyWithEntityManager(
        entityManager,
        previousProduct,
      );
      const updatedToProduct = await this.productService.findProductById(
        updateTransactionInDto.productId,
      );
      await this.productService.addProductQtyWithEntityManager(
        entityManager,
        updatedToProduct,
        updateTransactionInDto.converted_qty,
      );
    }
  }
}
