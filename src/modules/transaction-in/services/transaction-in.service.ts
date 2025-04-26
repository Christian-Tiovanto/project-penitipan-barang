import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransactionIn, TransactionIn } from '../models/transaction-in.entity';
import {
  Between,
  Brackets,
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
import {
  SortOrder,
  SortOrderQueryBuilder,
  TransactionInSort,
} from '@app/enums/sort-order';
import { GetTransactionInResponse } from '../classes/transaction-in.response';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { CreateBulkTransactionInDto } from '../dtos/create-bulk-transaction-in.dto';
import { TransactionInHeaderService } from './transaction-in-header.service';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';

interface GetAllTransactionInQuery {
  pageNo: number;
  pageSize: number;
  sort?: TransactionInSort;
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
export class TransactionInService {
  constructor(
    @InjectRepository(TransactionIn)
    private transactionInRepository: Repository<TransactionIn>,
    @InjectRepository(TransactionOut)
    private transactionOutRepository: Repository<TransactionOut>,
    private productService: ProductService,
    private productUnitService: ProductUnitService,
    private customerService: CustomerService,
    private transactionInHeaderService: TransactionInHeaderService,
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
  async createBulkTransactionIn(
    createBulkTransactionInDto: CreateBulkTransactionInDto,
  ): Promise<TransactionIn[]> {
    const { customerId } = createBulkTransactionInDto;
    const customer = await this.customerService.findCustomerById(customerId);
    const transaction = await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const transactionInHeader =
          await this.transactionInHeaderService.createTransactionInHeader(
            customer,
            entityManager,
          );
        const {
          transactionsToCreate,
          productToUpdate,
        }: { transactionsToCreate: any[]; productToUpdate: Product[] } =
          await this.prepareTransactionInBulkData(
            createBulkTransactionInDto,
            customer,
            transactionInHeader,
          );
        const newTransactionIn = entityManager.create(
          TransactionIn,
          transactionsToCreate,
        );
        await this.productService.updateBulkProduct(
          productToUpdate,
          entityManager,
        );
        return await entityManager.save(newTransactionIn);
      },
    );

    return transaction;
  }

  private async prepareTransactionInBulkData(
    createBulkTransactionInDto: CreateBulkTransactionInDto,
    customer: Customer,
    transactionInHeader: TransactionInHeader,
  ) {
    const transactionsToCreate = [];
    const productToUpdate: Product[] = [];
    for (const transactionIn of createBulkTransactionInDto.data) {
      const product = await this.productService.findProductById(
        transactionIn.productId,
      );
      const productUnit =
        await this.productUnitService.findProductUnitByIdNProductId(
          transactionIn.unitId,
          transactionIn.productId,
        );

      const convertedQty = transactionIn.qty * productUnit.conversion_to_kg;
      transactionIn.remaining_qty = convertedQty;
      transactionIn.converted_qty = convertedQty;
      transactionIn.conversion_to_kg = productUnit.conversion_to_kg;
      transactionIn.unit = productUnit.name;
      transactionIn.transaction_in_headerId = transactionInHeader.id;
      transactionIn.customerId = customer.id;
      const productAlreadyIn = productToUpdate.find(
        (value) => value.id === product.id,
      );
      if (productAlreadyIn) {
        productAlreadyIn.qty += transactionIn.converted_qty;
      } else {
        product.qty += transactionIn.converted_qty;
      }
      transactionsToCreate.push(transactionIn);
      productToUpdate.push(product);
    }
    return {
      transactionsToCreate,
      productToUpdate,
    };
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
    if (sort === TransactionInSort.TRANSACTION_IN_HEADER) {
      sortBy = `${sort}.code`;
    }

    const queryBuilder = this.transactionInRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect(
        'transaction.transaction_in_header',
        'transaction_in_header',
      )
      .skip(skip)
      .take(pageSize)
      .select([
        'transaction',
        'customer.name',
        'customer.id',
        'product.name',
        'product.id',
        'transaction_in_header.id',
        'transaction_in_header.code',
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
          qb.where('customer.name LIKE :search', { search: `%${search}%` })
            .orWhere('product.name LIKE :search', { search: `%${search}%` })
            .orWhere('transaction.qty LIKE :search', { search: `%${search}%` })
            .orWhere('unit LIKE :search', { search: `%${search}%` });
        }),
      );
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
          converted_qty: transaction.converted_qty,
          unit: transaction.unit,
          created_at: transaction.created_at,
          transaction_in_header: {
            id: transaction.transaction_in_header.id,
            code: transaction.transaction_in_header.code,
          },
        };
      });
    return [transactionInResponse, count];
  }

  async getTransactionForStockReport({
    endDate,
    customerId,
  }: getTransactionForStockReportQuery): Promise<
    {
      product_name: string;
      customer_name: string;
      customerId: number;
      productId: number;
      total_qty: number;
    }[]
  > {
    // 1. First create the grouped subquery
    const groupedQuery = this.transactionInRepository
      .createQueryBuilder('transaction')
      .select([
        'transaction.customerId AS customerId',
        'transaction.productId AS productId',
        'SUM(transaction.converted_qty) AS total_qty',
      ])
      .groupBy('customerId, productId');
    if (customerId) {
      groupedQuery.andWhere('customerId = :customerId', { customerId });
    }
    if (endDate) {
      groupedQuery.andWhere({ created_at: LessThan(endDate) });
    }
    // // 2. Main query with joins
    const result = await this.transactionInRepository
      .createQueryBuilder()
      .select([
        'grouped.customerId',
        'customer.name',
        'grouped.productId',
        'product.name',
        'grouped.total_qty',
      ])
      .from(`(${groupedQuery.getQuery()})`, 'grouped')
      .setParameters(groupedQuery.getParameters()) // Important: Pass the parameters!
      .leftJoin(Customer, 'customer', 'customer.id = grouped.customerId')
      .leftJoin(Product, 'product', 'product.id = grouped.productId')
      .groupBy('grouped.customerId, grouped.productId')
      .getRawMany();

    return result;
  }

  async findTransactionInById(id: number) {
    const transactionIn = await this.transactionInRepository.findOne({
      where: { id },
      relations: ['customer', 'product'],
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
    const transactionOutCount = await this.transactionOutRepository.count({
      where: { transaction_inId: transactionInId },
    });

    if (transactionOutCount > 0) {
      throw new ConflictException(
        "Can't update a Transaction In that already have Transaction Out",
      );
    }
    let transactionInToUpdate: TransactionIn[] = [];
    console.log(updateTransactionInDto.is_charge);
    if (
      updateTransactionInDto.customerId ||
      updateTransactionInDto.is_charge !== undefined
    ) {
      if (updateTransactionInDto.customerId) {
        await this.customerService.findCustomerById(
          updateTransactionInDto.customerId,
        );
        updateTransactionInDto.customerId = parseInt(
          `${updateTransactionInDto.customerId}`,
        );
        transactionIn.customer.id = updateTransactionInDto.customerId;
      }
      if (updateTransactionInDto.is_charge) {
        transactionIn.is_charge = updateTransactionInDto.is_charge;
      }
      const transIn = await this.transactionInRepository.find({
        where: {
          transaction_in_header: { id: transactionIn.transaction_in_headerId },
        },
      });
      transactionInToUpdate = transIn.map((transactionIn) => ({
        ...transactionIn,
        customerId:
          updateTransactionInDto.customerId ?? transactionIn.customerId,
        is_charge:
          updateTransactionInDto.is_charge !== undefined
            ? updateTransactionInDto.is_charge
            : transactionIn.is_charge,
      }));
    }
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
    transactionIn.product.id = updateTransactionInDto.productId;
    await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        await this.updateTransactionInProduct(
          transactionIn,
          updateTransactionInDto,
          entityManager,
        );

        updateTransactionInDto.remaining_qty =
          updateTransactionInDto.converted_qty;
        if (
          updateTransactionInDto.customerId ||
          updateTransactionInDto.is_charge !== undefined
        ) {
          await entityManager.save(TransactionIn, transactionInToUpdate);
          if (updateTransactionInDto.customerId) {
            await this.transactionInHeaderService.updateTransactionInHeaderCustomerId(
              transactionIn.transaction_in_headerId,
              updateTransactionInDto.customerId,
              entityManager,
            );
          }
        }
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

  // async getAllTransactionInByProductId(
  //   { pageNo, pageSize }: GetAllTransactionInQuery,
  //   productId: number,
  // ) {
  //   const skip = (pageNo - 1) * pageSize;
  //   const transactions = await this.transactionInRepository.findAndCount({
  //     skip,
  //     take: pageSize,
  //     where: {
  //       productId,
  //     },
  //     order: {
  //       created_at: 'DESC',
  //     },
  //     relations: ['customer', 'product'],
  //   });
  //   return transactions;
  // }

  async getAllTransactionInByHeaderId(
    headerId: number,
    {
      pageNo,
      pageSize,
      sort,
      order,
      startDate,
      endDate,
      search,
    }: GetAllTransactionInQuery,
  ): Promise<[GetTransactionInResponse[], number]> {
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
      .leftJoinAndSelect(
        'transaction.transaction_in_header',
        'transaction_in_header',
      )
      .skip(skip)
      .take(pageSize)
      .select([
        'transaction',
        'customer.name',
        'customer.id',
        'product.name',
        'product.id',
        'transaction_in_header.id',
        'transaction_in_header.code',
      ])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder)
      .andWhere('transaction_in_headerId = :headerId', { headerId });

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
          qb.where('customer.name LIKE :search', { search: `%${search}%` })
            .orWhere('product.name LIKE :search', { search: `%${search}%` })
            .orWhere('transaction.qty LIKE :search', { search: `%${search}%` })
            .orWhere('unit LIKE :search', { search: `%${search}%` });
        }),
      );
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
          created_at: transaction.created_at,
          transaction_in_header: {
            id: transaction.transaction_in_header.id,
            code: transaction.transaction_in_header.code,
          },
        };
      });
    return [transactionInResponse, count];
  }
}
