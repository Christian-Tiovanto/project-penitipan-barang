import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { TransactionOut } from '../models/transaction-out.entity';
import {
  CreateTransactionOutFifoWithSpbDto,
  CreateTransactionOutWithSpbDto,
} from '../dtos/create-transaction-out.dto';
import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { ProductService } from '@app/modules/product/services/product.service';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { TransactionInService } from '@app/modules/transaction-in/services/transaction-in.service';
import {
  convertToWIB,
  isOutsideBusinessHours,
  isPastDays,
  pastDaysCount,
} from '@app/utils/date';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { CreateInvoiceDto } from '@app/modules/invoice/dtos/create-invoice.dto';
import { CreateSpbDto } from '@app/modules/spb/dtos/create-spb.dto';
import { CreateArDto } from '@app/modules/ar/dtos/create-ar.dto';
import { InvoiceService } from '@app/modules/invoice/services/invoice.service';
import { ArService } from '@app/modules/ar/services/ar.service';
import { SpbService } from '@app/modules/spb/services/spb.service';
import { ChargeService } from '@app/modules/charge/services/charge.service';
import { InvoiceStatus } from '@app/enums/invoice-status';
import { ArStatus } from '@app/enums/ar-status';
import { ChargeType } from '@app/enums/charge-type';
import { TransactionOutSort } from '../classes/transaction-out.query';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { GetTransactionOutResponse } from '../classes/transaction-out.response';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { TransactionInHeader } from '@app/modules/transaction-in/models/transaction-in-header.entity';
import { TransactionInHeaderService } from '@app/modules/transaction-in/services/transaction-in-header.service';
import { InsufficientStockException } from '@app/exceptions/validation.exception';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
  sort?: TransactionOutSort;
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
export class TransactionOutService {
  constructor(
    @InjectRepository(TransactionOut)
    private readonly transactionOutRepository: Repository<TransactionOut>,
    private productService: ProductService,
    private transactionInService: TransactionInService,
    private invoiceService: InvoiceService,
    private customerService: CustomerService,
    private arService: ArService,
    private spbService: SpbService,
    private chargeService: ChargeService,
    private transactionInHeaderService: TransactionInHeaderService,
  ) {}

  async getAllTransactionOuts({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
  }: GetAllQuery): Promise<[GetTransactionOutResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;
    let sortBy: string = `transaction.${sort}`;
    if (
      sort === TransactionOutSort.CUSTOMER ||
      sort === TransactionOutSort.PRODUCT
    ) {
      sortBy = `${sort}.name`;
    }
    if (sort === TransactionOutSort.INVOICE) {
      sortBy = `${sort}.invoice_no`;
    }
    const queryBuilder = this.transactionOutRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.invoice', 'invoice')
      .skip(skip)
      .take(pageSize)
      .select([
        'transaction',
        'customer.name',
        'customer.id',
        'product.name',
        'product.id',
        'invoice.id',
        'invoice.invoice_no',
      ])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

    const [transactionsOuts, count] = await queryBuilder.getManyAndCount();
    const transactionOutResponse: GetTransactionOutResponse[] =
      transactionsOuts.map((transaction: GetTransactionOutResponse) => {
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
          invoice: {
            id: transaction.invoice.id,
            invoice_no: transaction.invoice.invoice_no,
          },
          converted_qty: transaction.converted_qty,
          is_charge: transaction.is_charge,
          total_days: transaction.total_days,
        };
      });
    return [transactionOutResponse, count];
  }

  async getTransactionOutById(
    transactionOutId: number,
  ): Promise<TransactionOut> {
    return await this.transactionOutRepository.findOne({
      where: { id: transactionOutId },
    });
  }

  async sumCustProductQty(
    productId: number,
    customerId: number,
    startDate: Date,
  ) {
    const result: { sum?: string } = await this.transactionOutRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.converted_qty)', 'sum')
      .where('transaction.created_at < :startDate', { startDate })
      .andWhere('transaction.productId = :productId', { productId })
      .andWhere('transaction.customerId = :customerId', { customerId })
      .getRawOne();

    return parseFloat(result?.sum || '0');
  }

  async getTransactionOutForStockBookReport(
    productId: number,
    customerId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const [transactionOuts, sumResult] = (await Promise.all([
      // First promise - returns TransactionIn[]
      this.transactionOutRepository.find({
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
      this.transactionOutRepository
        .createQueryBuilder()
        .select('SUM(converted_qty)', 'sum')
        .where({
          created_at: Between(startDate, endDate),
          productId,
          customerId,
        })
        .getRawOne(),
    ])) as [TransactionOut[], { sum: string } | undefined];

    return {
      transactionOuts,
      totalSum: parseFloat(sumResult?.sum || '0'),
    };
  }

  async findTransactionOutById(
    transactionOutId: number,
  ): Promise<TransactionOut> {
    const transactionOut = await this.transactionOutRepository.findOne({
      where: { id: transactionOutId },
    });

    if (!transactionOut) {
      throw new NotFoundException(
        `Transaction Out with id ${transactionOutId} not found`,
      );
    }
    return transactionOut;
  }

  async updateTransactionOutNull(
    entityManager: EntityManager,
    invoiceId: number,
    spbId: number,
  ): Promise<void> {
    await entityManager.update(
      TransactionOut,
      { invoiceId: IsNull(), spbId: IsNull() },
      { invoiceId, spbId },
    );
    return;
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
    const groupedQuery = this.transactionOutRepository
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
    const result = await this.transactionOutRepository
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

  async createTransactionOut(
    createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto,
  ): Promise<Invoice> {
    const transaction = await this.transactionOutRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        let amount: number = 0;
        let totalQty: number = 0;
        const customerId = createTransactionOutWithSpbDto.customerId;
        const noPlat = createTransactionOutWithSpbDto.no_plat;
        const clockOut = createTransactionOutWithSpbDto.clock_out;
        const transinHeaderId =
          createTransactionOutWithSpbDto.transaction_in_headerId;
        const transDate = createTransactionOutWithSpbDto.transaction_date;

        const detailTransIn =
          await this.transactionInHeaderService.findTransactionInHeaderById(
            transinHeaderId,
          );

        const totalConvertedQty: number =
          createTransactionOutWithSpbDto.transaction_outs.reduce(
            (sum, transaction) => sum + transaction.converted_qty,
            0,
          );

        let totalCharge: number = 0;
        let totalFine: number = 0;

        const valueCharge = await this.chargeService.findChargeById(1);

        for (const transactionOut of createTransactionOutWithSpbDto.transaction_outs) {
          const product = await this.productService.lockingProductById(
            entityManager,
            transactionOut.productId,
            transactionOut.converted_qty,
          );

          const productTransactionIns = detailTransIn.transaction_in.filter(
            (t) => t.productId === transactionOut.productId,
          );

          if (productTransactionIns.length === 0) {
            throw new NotFoundException(
              `No incoming transaction In Detail found for productId ${transactionOut.productId}.`,
            );
          }

          let productQty: number = transactionOut.converted_qty;

          const totalPrice: number =
            transactionOut.converted_qty * product.price;
          amount += totalPrice;

          // const productTransactionIns =
          //   await this.transactionInService.getTransactionInsWithRemainingQty(
          //     product.id,
          //     customerId,
          //     transactionOut.converted_qty,
          //   );

          for (const transactionIn of productTransactionIns) {
            if (productQty == 0) {
              break;
            }
            let qtyOut: number;

            if (transactionIn.remaining_qty < productQty) {
              throw new InsufficientStockException(
                `Insufficient stock : ${product.name} required ${productQty}, but only ${transactionIn.remaining_qty} available in Transaction In`,
              );
            }

            await this.transactionInService.lockingTransactionInById(
              entityManager,
              transactionIn.id,
            );

            let fine: number = 0;
            if (isPastDays(transactionIn.created_at, 120, transDate)) {
              fine = totalPrice * 4;
            } else if (isPastDays(transactionIn.created_at, 90, transDate)) {
              fine = totalPrice * 3;
            } else if (isPastDays(transactionIn.created_at, 60, transDate)) {
              fine = totalPrice * 2;
            } else if (isPastDays(transactionIn.created_at, 30, transDate)) {
              fine = totalPrice;
            }

            const totalDays = pastDaysCount(transactionIn.created_at);
            totalFine += fine;

            if (transactionIn.remaining_qty > productQty) {
              await this.productService.withdrawProductQtyWithEntityManager(
                entityManager,
                product,
                productQty,
              );

              await this.transactionInService.withdrawRemainingQtyWithEntityManager(
                entityManager,
                transactionIn,
                productQty,
              );

              qtyOut = productQty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;
              transactionOut.converted_qty = productQty;
              productQty = 0;
            } else {
              productQty -= transactionIn.remaining_qty;

              qtyOut =
                transactionIn.remaining_qty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;

              transactionOut.converted_qty = transactionIn.remaining_qty;

              await this.productService.withdrawProductQtyWithEntityManager(
                entityManager,
                product,
                transactionIn.remaining_qty,
              );

              await this.transactionInService.withdrawRemainingQtyWithEntityManager(
                entityManager,
                transactionIn,
                transactionIn.remaining_qty,
              );
            }

            let charge: number = 0;
            let chargeAmount: number = 0;

            if (valueCharge.type == ChargeType.PERCENTAGE) {
              chargeAmount = (valueCharge.amount * totalPrice) / 100;
            } else {
              chargeAmount = valueCharge.amount * transactionOut.converted_qty;
            }

            if (transactionIn.is_charge == true) {
              charge += chargeAmount;
            }

            if (transactionOut.is_charge == true) {
              charge += chargeAmount;
            }

            totalCharge += charge;
            transactionOut.productId = transactionIn.productId;
            transactionOut.customerId = customerId;
            transactionOut.conversion_to_kg = transactionIn.conversion_to_kg;
            transactionOut.qty = qtyOut;
            transactionOut.price = product.price;
            transactionOut.total_charge = charge;
            transactionOut.total_days = totalDays;
            transactionOut.total_fine = fine;
            transactionOut.total_price =
              product.price * transactionOut.converted_qty;
            transactionOut.unit = transactionIn.unit;
            transactionOut.transaction_inId = transactionIn.id;
            transactionOut.created_at = transDate;
            transactionOut.updated_at = transDate;

            const transactionOutSave = entityManager.create(
              TransactionOut,
              transactionOut,
            );
            //save
            await entityManager.save(transactionOutSave);
          }
          //here
        }

        const customer =
          await this.customerService.findCustomerById(customerId);

        let invoiceMaxId: number = await this.invoiceService.getMaxIdInvoice();
        invoiceMaxId += 1;
        const invoiceNo = `${customer.code}-${String(invoiceMaxId).padStart(5, '0')}`;

        let arMaxId: number = await this.arService.getMaxIdAr();
        arMaxId += 1;
        const arNo = `${customer.code}-${String(arMaxId).padStart(5, '0')}`;

        const createInvoice = new CreateInvoiceDto();
        createInvoice.total_amount = amount;
        createInvoice.customerId = customerId;
        createInvoice.discount = 0;
        createInvoice.fine = totalFine;
        createInvoice.invoice_no = invoiceNo;
        createInvoice.status = InvoiceStatus.PENDING;
        createInvoice.tax = 0;
        createInvoice.total_order = totalQty;
        createInvoice.total_order_converted = totalConvertedQty;
        createInvoice.charge = totalCharge;
        createInvoice.created_at = transDate;
        createInvoice.updated_at = transDate;

        const invoice = await this.invoiceService.createInvoice(
          createInvoice,
          entityManager,
        );

        const createSpb = new CreateSpbDto();
        createSpb.clock_out = clockOut;
        createSpb.invoiceId = invoice.id;
        createSpb.customerId = customerId;
        createSpb.no_plat = noPlat;
        createSpb.created_at = transDate;
        createSpb.updated_at = transDate;

        const spb = await this.spbService.createSpb(createSpb, entityManager);

        const createAr = new CreateArDto();
        createAr.ar_no = arNo;
        createAr.customerId = customerId;
        createAr.invoiceId = invoice.id;
        createAr.status = ArStatus.PENDING;
        createAr.to_paid =
          invoice.total_amount +
          invoice.fine +
          invoice.charge +
          invoice.tax -
          invoice.discount;
        createAr.paid_date = null;
        createAr.total_bill =
          invoice.total_amount +
          invoice.fine +
          invoice.charge +
          invoice.tax -
          invoice.discount;
        createAr.created_at = transDate;
        createAr.updated_at = transDate;

        const ar = await this.arService.createAr(createAr, entityManager);

        await this.updateTransactionOutNull(entityManager, invoice.id, spb.id);
        return invoice;
      },
    );
    return transaction;
  }

  async createTransactionOutFifo(
    createTransactionOutFifoWithSpbDto: CreateTransactionOutFifoWithSpbDto,
  ): Promise<Invoice> {
    const transaction = await this.transactionOutRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        let amount: number = 0;
        let totalQty: number = 0;
        const customerId = createTransactionOutFifoWithSpbDto.customerId;
        const noPlat = createTransactionOutFifoWithSpbDto.no_plat;
        const clockOut = createTransactionOutFifoWithSpbDto.clock_out;
        const transDate = createTransactionOutFifoWithSpbDto.transaction_date;
        // const transinHeaderId =
        //   createTransactionOutWithSpbDto.transaction_in_headerId;

        // const detailTransIn =
        //   await this.transactionInHeaderService.findTransactionInHeaderById(
        //     transinHeaderId,
        //   );

        const totalConvertedQty: number =
          createTransactionOutFifoWithSpbDto.transaction_outs.reduce(
            (sum, transaction) => sum + transaction.converted_qty,
            0,
          );

        let totalCharge: number = 0;
        let totalFine: number = 0;

        const valueCharge = await this.chargeService.findChargeById(1);

        for (const transactionOut of createTransactionOutFifoWithSpbDto.transaction_outs) {
          const product = await this.productService.lockingProductById(
            entityManager,
            transactionOut.productId,
            transactionOut.converted_qty,
          );

          // const productTransactionIns = detailTransIn.transaction_in.filter(
          //   (t) => t.productId === transactionOut.productId,
          // );

          // if (productTransactionIns.length === 0) {
          //   throw new NotFoundException(
          //     `No incoming transaction In Detail found for productId ${transactionOut.productId}.`,
          //   );
          // }

          let productQty: number = transactionOut.converted_qty;

          const totalPrice: number =
            transactionOut.converted_qty * product.price;
          amount += totalPrice;

          const productTransactionIns =
            await this.transactionInService.getTransactionInsWithRemainingQty(
              product.id,
              customerId,
              transactionOut.converted_qty,
            );

          for (const transactionIn of productTransactionIns) {
            if (productQty == 0) {
              break;
            }
            let qtyOut: number;

            // if (transactionIn.remaining_qty < productQty) {
            //   throw new InsufficientStockException(
            //     `Insufficient stock : ${product.name} required ${productQty}, but only ${transactionIn.remaining_qty} available in Transaction In`,
            //   );
            // }

            await this.transactionInService.lockingTransactionInById(
              entityManager,
              transactionIn.id,
            );

            let fine: number = 0;
            if (isPastDays(transactionIn.created_at, 120, transDate)) {
              fine = totalPrice * 4;
            } else if (isPastDays(transactionIn.created_at, 90, transDate)) {
              fine = totalPrice * 3;
            } else if (isPastDays(transactionIn.created_at, 60, transDate)) {
              fine = totalPrice * 2;
            } else if (isPastDays(transactionIn.created_at, 30, transDate)) {
              fine = totalPrice;
            }

            const totalDays = pastDaysCount(transactionIn.created_at);
            totalFine += fine;

            if (transactionIn.remaining_qty > productQty) {
              await this.productService.withdrawProductQtyWithEntityManager(
                entityManager,
                product,
                productQty,
              );

              await this.transactionInService.withdrawRemainingQtyWithEntityManager(
                entityManager,
                transactionIn,
                productQty,
              );

              qtyOut = productQty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;
              transactionOut.converted_qty = productQty;
              productQty = 0;
            } else {
              productQty -= transactionIn.remaining_qty;

              qtyOut =
                transactionIn.remaining_qty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;

              transactionOut.converted_qty = transactionIn.remaining_qty;

              await this.productService.withdrawProductQtyWithEntityManager(
                entityManager,
                product,
                transactionIn.remaining_qty,
              );

              await this.transactionInService.withdrawRemainingQtyWithEntityManager(
                entityManager,
                transactionIn,
                transactionIn.remaining_qty,
              );
            }

            let charge: number = 0;
            let chargeAmount: number = 0;

            if (valueCharge.type == ChargeType.PERCENTAGE) {
              chargeAmount = (valueCharge.amount * totalPrice) / 100;
            } else {
              chargeAmount = valueCharge.amount * transactionOut.converted_qty;
            }

            if (transactionIn.is_charge == true) {
              charge += chargeAmount;
            }

            if (transactionOut.is_charge == true) {
              charge += chargeAmount;
            }

            totalCharge += charge;

            transactionOut.productId = transactionIn.productId;
            transactionOut.customerId = customerId;
            transactionOut.conversion_to_kg = transactionIn.conversion_to_kg;
            transactionOut.qty = qtyOut;
            transactionOut.price = product.price;
            transactionOut.total_charge = charge;
            transactionOut.total_days = totalDays;
            transactionOut.total_fine = fine;
            transactionOut.total_price =
              product.price * transactionOut.converted_qty;
            transactionOut.unit = transactionIn.unit;
            transactionOut.transaction_inId = transactionIn.id;
            transactionOut.created_at = transDate;
            transactionOut.updated_at = transDate;

            const transactionOutSave = entityManager.create(
              TransactionOut,
              transactionOut,
            );
            //save
            await entityManager.save(transactionOutSave);
          }
          //here
        }

        const customer =
          await this.customerService.findCustomerById(customerId);

        let invoiceMaxId: number = await this.invoiceService.getMaxIdInvoice();
        invoiceMaxId += 1;
        const invoiceNo = `${customer.code}-${String(invoiceMaxId).padStart(5, '0')}`;

        let arMaxId: number = await this.arService.getMaxIdAr();
        arMaxId += 1;
        const arNo = `${customer.code}-${String(arMaxId).padStart(5, '0')}`;

        const createInvoice = new CreateInvoiceDto();
        createInvoice.total_amount = amount;
        createInvoice.customerId = customerId;
        createInvoice.discount = 0;
        createInvoice.fine = totalFine;
        createInvoice.invoice_no = invoiceNo;
        createInvoice.status = InvoiceStatus.PENDING;
        createInvoice.tax = 0;
        createInvoice.total_order = totalQty;
        createInvoice.total_order_converted = totalConvertedQty;
        createInvoice.charge = totalCharge;
        createInvoice.created_at = transDate;
        createInvoice.updated_at = transDate;

        const invoice = await this.invoiceService.createInvoice(
          createInvoice,
          entityManager,
        );

        const createSpb = new CreateSpbDto();
        createSpb.clock_out = clockOut;
        createSpb.invoiceId = invoice.id;
        createSpb.customerId = customerId;
        createSpb.no_plat = noPlat;
        createSpb.created_at = transDate;
        createSpb.updated_at = transDate;

        const spb = await this.spbService.createSpb(createSpb, entityManager);

        const createAr = new CreateArDto();
        createAr.ar_no = arNo;
        createAr.customerId = customerId;
        createAr.invoiceId = invoice.id;
        createAr.status = ArStatus.PENDING;
        createAr.to_paid =
          invoice.total_amount +
          invoice.fine +
          invoice.charge +
          invoice.tax -
          invoice.discount;
        createAr.paid_date = null;
        createAr.total_bill =
          invoice.total_amount +
          invoice.fine +
          invoice.charge +
          invoice.tax -
          invoice.discount;
        createAr.created_at = transDate;
        createAr.updated_at = transDate;
        const ar = await this.arService.createAr(createAr, entityManager);

        await this.updateTransactionOutNull(entityManager, invoice.id, spb.id);
        return invoice;
      },
    );
    return transaction;
  }

  async updateTransactionOut(
    transactionOutId: number,
    updateTransactionOutDto: UpdateTransactionOutDto,
  ): Promise<TransactionOut> {
    const transactionOut = await this.findTransactionOutById(transactionOutId);

    Object.assign(transactionOut, updateTransactionOutDto);

    return this.transactionOutRepository.save(transactionOut);
  }

  async previewTransactionOut(
    createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto,
  ): Promise<CreateInvoiceDto> {
    const transaction = await this.transactionOutRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        let amount: number = 0;
        let totalQty: number = 0;
        const customerId = createTransactionOutWithSpbDto.customerId;
        // const noPlat = createTransactionOutWithSpbDto.no_plat;
        // const clockOut = createTransactionOutWithSpbDto.clock_out;
        const transinHeaderId =
          createTransactionOutWithSpbDto.transaction_in_headerId;

        const detailTransIn =
          await this.transactionInHeaderService.findTransactionInHeaderById(
            transinHeaderId,
          );

        const transDate = createTransactionOutWithSpbDto.transaction_date;

        const totalConvertedQty: number =
          createTransactionOutWithSpbDto.transaction_outs.reduce(
            (sum, transaction) => sum + transaction.converted_qty,
            0,
          );

        let totalCharge: number = 0;
        let totalFine: number = 0;

        const valueCharge = await this.chargeService.findChargeById(1);

        for (const transactionOut of createTransactionOutWithSpbDto.transaction_outs) {
          const product = await this.productService.lockingProductById(
            entityManager,
            transactionOut.productId,
            transactionOut.converted_qty,
          );

          const productTransactionIns = detailTransIn.transaction_in.filter(
            (t) => t.productId === transactionOut.productId,
          );

          if (productTransactionIns.length === 0) {
            throw new NotFoundException(
              `No incoming transaction In Detail found for productId ${transactionOut.productId}.`,
            );
          }

          let productQty: number = transactionOut.converted_qty;

          const totalPrice: number =
            transactionOut.converted_qty * product.price;
          amount += totalPrice;

          // const productTransactionIns =
          //   await this.transactionInService.getTransactionInsWithRemainingQty(
          //     product.id,
          //     customerId,
          //     transactionOut.converted_qty,
          //   );
          for (const transactionIn of productTransactionIns) {
            if (productQty == 0) {
              break;
            }
            let qtyOut: number;

            if (transactionIn.remaining_qty < productQty) {
              throw new InsufficientStockException(
                `Insufficient stock : ${product.name} required ${productQty}, but only ${transactionIn.remaining_qty} available in Transaction In`,
              );
            }

            await this.transactionInService.lockingTransactionInById(
              entityManager,
              transactionIn.id,
            );

            let fine: number = 0;
            if (isPastDays(transactionIn.created_at, 120, transDate)) {
              fine = totalPrice * 4;
            } else if (isPastDays(transactionIn.created_at, 90, transDate)) {
              fine = totalPrice * 3;
            } else if (isPastDays(transactionIn.created_at, 60, transDate)) {
              fine = totalPrice * 2;
            } else if (isPastDays(transactionIn.created_at, 30, transDate)) {
              fine = totalPrice;
            }

            const totalDays = pastDaysCount(transactionIn.created_at);
            totalFine += fine;

            if (transactionIn.remaining_qty > productQty) {
              // await this.productService.withdrawProductQtyWithEntityManager(
              //   entityManager,
              //   product,
              //   productQty,)

              // await this.transactionInService.withdrawRemainingQtyWithEntityManager(
              //   entityManager,
              //   transactionIn,
              //   productQty,)

              qtyOut = productQty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;
              transactionOut.converted_qty = productQty;
              productQty = 0;
            } else {
              productQty -= transactionIn.remaining_qty;

              qtyOut =
                transactionIn.remaining_qty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;

              transactionOut.converted_qty = transactionIn.remaining_qty;

              // await this.productService.withdrawProductQtyWithEntityManager(
              //   entityManager,
              //   product,
              //   transactionIn.remaining_qty,);

              // await this.transactionInService.withdrawRemainingQtyWithEntityManager(
              //   entityManager,
              //   transactionIn,
              //   transactionIn.remaining_qty,);
            }

            let charge: number = 0;
            let chargeAmount: number = 0;

            if (valueCharge.type == ChargeType.PERCENTAGE) {
              chargeAmount = (valueCharge.amount * totalPrice) / 100;
            } else {
              chargeAmount = valueCharge.amount * transactionOut.converted_qty;
            }

            if (transactionIn.is_charge == true) {
              charge += chargeAmount;
            }

            if (transactionOut.is_charge == true) {
              charge += chargeAmount;
            }

            totalCharge += charge;

            transactionOut.productId = transactionIn.productId;
            transactionOut.customerId = customerId;
            transactionOut.conversion_to_kg = transactionIn.conversion_to_kg;
            transactionOut.qty = qtyOut;
            transactionOut.price = product.price;
            transactionOut.total_charge = charge;
            transactionOut.total_days = totalDays;
            transactionOut.total_fine = fine;
            transactionOut.total_price =
              product.price * transactionOut.converted_qty;
            transactionOut.unit = transactionIn.unit;
            transactionOut.transaction_inId = transactionIn.id;
            transactionOut.created_at = transDate;
            transactionOut.updated_at = transDate;

            // const transactionOutSave = entityManager.create(
            //   TransactionOut,
            //   transactionOut,
            // );
            //save
            // await entityManager.save(transactionOutSave);
          }
        }

        const customer =
          await this.customerService.findCustomerById(customerId);

        let invoiceMaxId: number = await this.invoiceService.getMaxIdInvoice();
        invoiceMaxId += 1;
        const invoiceNo = `${customer.code}-${String(invoiceMaxId).padStart(5, '0')}`;

        let arMaxId: number = await this.arService.getMaxIdAr();
        arMaxId += 1;
        const arNo = `${customer.code}-${String(arMaxId).padStart(5, '0')}`;

        const createInvoice = new CreateInvoiceDto();
        createInvoice.total_amount = amount;
        createInvoice.customerId = customerId;
        createInvoice.discount = 0;
        createInvoice.fine = totalFine;
        createInvoice.invoice_no = invoiceNo;
        createInvoice.status = InvoiceStatus.PENDING;
        createInvoice.tax = 0;
        createInvoice.total_order = totalQty;
        createInvoice.total_order_converted = totalConvertedQty;
        createInvoice.charge = totalCharge;
        createInvoice.created_at = transDate;
        createInvoice.updated_at = transDate;
        // const invoice = await this.invoiceService.createInvoice(createInvoice, entityManager)

        // const createSpb = new CreateSpbDto();
        // createSpb.clock_out = clockOut;
        // createSpb.invoiceId = invoice.id
        // createSpb.customerId = customerId;
        // createSpb.no_plat = noPlat;

        // const spb = await this.spbService.createSpb(createSpb, entityManager);

        // const createAr = new CreateArDto();
        // createAr.ar_no = arNo;
        // createAr.customerId = customerId;
        // createAr.invoiceId = invoice.id
        // createAr.status = ArStatus.PENDING;
        // createAr.to_paid = (invoice.total_amount + invoice.fine + invoice.charge + invoice.tax) - invoice.discount;
        // createAr.paid_date = null;
        // createAr.total_bill = (invoice.total_amount + invoice.fine + invoice.charge + invoice.tax) - invoice.discount;
        // const ar = await this.arService.createAr(createAr, entityManager);

        // await this.updateTransactionOutNull(entityManager, invoice.id, spb.id);
        return createInvoice;
      },
    );
    return transaction;
  }

  async previewTransactionOutFifo(
    createTransactionOutFifoWithSpbDto: CreateTransactionOutFifoWithSpbDto,
  ): Promise<CreateInvoiceDto> {
    const transaction = await this.transactionOutRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        let amount: number = 0;
        let totalQty: number = 0;
        const customerId = createTransactionOutFifoWithSpbDto.customerId;
        const transDate = createTransactionOutFifoWithSpbDto.transaction_date;
        // const noPlat = createTransactionOutWithSpbDto.no_plat;
        // const clockOut = createTransactionOutWithSpbDto.clock_out;

        const totalConvertedQty: number =
          createTransactionOutFifoWithSpbDto.transaction_outs.reduce(
            (sum, transaction) => sum + transaction.converted_qty,
            0,
          );

        let totalCharge: number = 0;
        let totalFine: number = 0;

        const valueCharge = await this.chargeService.findChargeById(1);

        for (const transactionOut of createTransactionOutFifoWithSpbDto.transaction_outs) {
          const product = await this.productService.lockingProductById(
            entityManager,
            transactionOut.productId,
            transactionOut.converted_qty,
          );

          let productQty: number = transactionOut.converted_qty;

          const totalPrice: number =
            transactionOut.converted_qty * product.price;
          amount += totalPrice;

          const productTransactionIns =
            await this.transactionInService.getTransactionInsWithRemainingQty(
              product.id,
              customerId,
              transactionOut.converted_qty,
            );

          for (const transactionIn of productTransactionIns) {
            if (productQty == 0) {
              break;
            }
            let qtyOut: number;

            await this.transactionInService.lockingTransactionInById(
              entityManager,
              transactionIn.id,
            );

            let fine: number = 0;
            if (isPastDays(transactionIn.created_at, 120, transDate)) {
              fine = totalPrice * 4;
            } else if (isPastDays(transactionIn.created_at, 90, transDate)) {
              fine = totalPrice * 3;
            } else if (isPastDays(transactionIn.created_at, 60, transDate)) {
              fine = totalPrice * 2;
            } else if (isPastDays(transactionIn.created_at, 30, transDate)) {
              fine = totalPrice;
            }

            const totalDays = pastDaysCount(transactionIn.created_at);
            totalFine += fine;

            if (transactionIn.remaining_qty > productQty) {
              // await this.productService.withdrawProductQtyWithEntityManager(
              //   entityManager,
              //   product,
              //   productQty,)

              // await this.transactionInService.withdrawRemainingQtyWithEntityManager(
              //   entityManager,
              //   transactionIn,
              //   productQty,)

              qtyOut = productQty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;
              transactionOut.converted_qty = productQty;
              productQty = 0;
            } else {
              productQty -= transactionIn.remaining_qty;

              qtyOut =
                transactionIn.remaining_qty / transactionIn.conversion_to_kg;
              totalQty += qtyOut;

              transactionOut.converted_qty = transactionIn.remaining_qty;

              // await this.productService.withdrawProductQtyWithEntityManager(
              //   entityManager,
              //   product,
              //   transactionIn.remaining_qty,);

              // await this.transactionInService.withdrawRemainingQtyWithEntityManager(
              //   entityManager,
              //   transactionIn,
              //   transactionIn.remaining_qty,);
            }

            let charge: number = 0;
            let chargeAmount: number = 0;

            if (valueCharge.type == ChargeType.PERCENTAGE) {
              chargeAmount = (valueCharge.amount * totalPrice) / 100;
            } else {
              chargeAmount = valueCharge.amount * transactionOut.converted_qty;
            }

            if (transactionIn.is_charge == true) {
              charge += chargeAmount;
            }

            if (transactionOut.is_charge == true) {
              charge += chargeAmount;
            }

            totalCharge += charge;

            transactionOut.productId = transactionIn.productId;
            transactionOut.customerId = customerId;
            transactionOut.conversion_to_kg = transactionIn.conversion_to_kg;
            transactionOut.qty = qtyOut;
            transactionOut.price = product.price;
            transactionOut.total_charge = charge;
            transactionOut.total_days = totalDays;
            transactionOut.total_fine = fine;
            transactionOut.total_price =
              product.price * transactionOut.converted_qty;
            transactionOut.unit = transactionIn.unit;
            transactionOut.transaction_inId = transactionIn.id;
            transactionOut.created_at = transDate;
            transactionOut.updated_at = transDate;

            // const transactionOutSave = entityManager.create(
            //   TransactionOut,
            //   transactionOut,
            // );
            //save
            // await entityManager.save(transactionOutSave);
          }
        }

        const customer =
          await this.customerService.findCustomerById(customerId);

        let invoiceMaxId: number = await this.invoiceService.getMaxIdInvoice();
        invoiceMaxId += 1;
        const invoiceNo = `${customer.code}-${String(invoiceMaxId).padStart(5, '0')}`;

        let arMaxId: number = await this.arService.getMaxIdAr();
        arMaxId += 1;
        const arNo = `${customer.code}-${String(arMaxId).padStart(5, '0')}`;

        const createInvoice = new CreateInvoiceDto();
        createInvoice.total_amount = amount;
        createInvoice.customerId = customerId;
        createInvoice.discount = 0;
        createInvoice.fine = totalFine;
        createInvoice.invoice_no = invoiceNo;
        createInvoice.status = InvoiceStatus.PENDING;
        createInvoice.tax = 0;
        createInvoice.total_order = totalQty;
        createInvoice.total_order_converted = totalConvertedQty;
        createInvoice.charge = totalCharge;
        createInvoice.created_at = transDate;
        createInvoice.updated_at = transDate;
        // const invoice = await this.invoiceService.createInvoice(createInvoice, entityManager)

        // const createSpb = new CreateSpbDto();
        // createSpb.clock_out = clockOut;
        // createSpb.invoiceId = invoice.id
        // createSpb.customerId = customerId;
        // createSpb.no_plat = noPlat;

        // const spb = await this.spbService.createSpb(createSpb, entityManager);

        // const createAr = new CreateArDto();
        // createAr.ar_no = arNo;
        // createAr.customerId = customerId;
        // createAr.invoiceId = invoice.id
        // createAr.status = ArStatus.PENDING;
        // createAr.to_paid = (invoice.total_amount + invoice.fine + invoice.charge + invoice.tax) - invoice.discount;
        // createAr.paid_date = null;
        // createAr.total_bill = (invoice.total_amount + invoice.fine + invoice.charge + invoice.tax) - invoice.discount;
        // const ar = await this.arService.createAr(createAr, entityManager);

        // await this.updateTransactionOutNull(entityManager, invoice.id, spb.id);
        return createInvoice;
      },
    );
    return transaction;
  }

  async getTransactionOutsByInvoiceId(
    invoiceId: number,
  ): Promise<TransactionOut[]> {
    const transactionOuts = await this.transactionOutRepository.find({
      where: { invoiceId },
      relations: ['product', 'customer'],
    });

    if (transactionOuts.length === 0) {
      throw new NotFoundException(
        `Transaction Out with Invoice Id ${invoiceId} not found`,
      );
    }
    return transactionOuts;
  }
}
