import { ProductService } from '@app/modules/product/services/product.service';
import { TransactionInService } from '@app/modules/transaction-in/services/transaction-in.service';
import { TransactionOutService } from '@app/modules/transaction-out/services/transaction-out.service';
import {
  IStockReportData,
  NettIncomeReportResponse,
  StockBookReportResponse,
} from '../classes/report.response';
import { Injectable } from '@nestjs/common';
import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
import { Repository } from 'typeorm';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CashflowService } from '@app/modules/cashflow/services/cashflow.service';
import { CashflowType } from '@app/enums/cashflow-type';
interface StockBookReportQuery {
  startDate: Date;
  endDate: Date;
}
interface NettIncomeReportQuery {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ReportService {
  constructor(
    private readonly transactionInService: TransactionInService,
    private readonly transactionOutService: TransactionOutService,
    private readonly productService: ProductService,
    private readonly cashflowService: CashflowService,
    @InjectRepository(TransactionIn)
    private readonly transactionInRepository: Repository<TransactionIn>,
    @InjectRepository(TransactionOut)
    private readonly transactionOutRepository: Repository<TransactionOut>,
  ) {}

  async stockBookReport(
    productId: number,
    customerId: number,
    { startDate, endDate }: StockBookReportQuery,
  ): Promise<StockBookReportResponse> {
    const product = await this.productService.findProductById(productId);
    const sumInQty = await this.transactionInService.sumCustProductQty(
      productId,
      customerId,
      startDate,
    );
    const sumOutQty = await this.transactionOutService.sumCustProductQty(
      productId,
      customerId,
      startDate,
    );
    const { totalSum: totalSumIn, transactionsIns } =
      await this.transactionInService.getTransactionInForStockBookReport(
        productId,
        customerId,
        startDate,
        endDate,
      );
    const { totalSum: totalSumOut, transactionOuts } =
      await this.transactionOutService.getTransactionOutForStockBookReport(
        productId,
        customerId,
        startDate,
        endDate,
      );
    const allTransactions = [
      ...transactionsIns.map((value) => ({ ...value, type: 'Add' })),
      ...transactionOuts.map((value) => ({ ...value, type: 'Out' })),
    ];
    allTransactions.sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );
    const data: StockBookReportResponse = {
      initial_qty: sumInQty - sumOutQty + product.initial_qty,
      final_qty:
        product.initial_qty + sumInQty + totalSumIn - sumOutQty - totalSumOut,
      product: { id: product.id, name: product.name },
      transactions: [
        ...allTransactions.map((value) => {
          return {
            date: value.created_at,
            type: value.type,
            qty: value.converted_qty,
          };
        }),
      ],
    };
    return data;
  }

  async stockReport(endDate: Date, customerId?: number) {
    const [inResults, outResults] = await Promise.all([
      this.transactionInService.getTransactionForStockReport({
        endDate,
        customerId,
      }),
      this.transactionOutService.getTransactionForStockReport({
        endDate,
        customerId,
      }),
    ]);

    const combinedMap = new Map<string, IStockReportData>();

    // Create unique key for grouping
    const getKey = (customerId: number, productId: number) =>
      `${customerId}-${productId}`;

    // Process IN results
    inResults.forEach((item) => {
      const key = getKey(item.customerId, item.productId);
      combinedMap.set(key, {
        customerId: item.customerId,
        productId: item.productId,
        customer_name: item.customer_name,
        product_name: item.product_name,
        product_in: Number(item.total_qty),
        product_out: 0,
      });
    });

    // Process OUT results
    outResults.forEach((item) => {
      const key = getKey(item.customerId, item.productId);
      if (combinedMap.has(key)) {
        combinedMap.get(key).product_out = Number(item.total_qty);
      } else {
        combinedMap.set(key, {
          customerId: item.customerId,
          productId: item.productId,
          customer_name: item.customer_name,
          product_name: item.product_name,
          product_in: 0,
          product_out: Number(item.total_qty),
        });
      }
    });
    return Array.from(combinedMap.values());
  }

  async nettIncomeReport({
    startDate,
    endDate,
  }: NettIncomeReportQuery): Promise<NettIncomeReportResponse> {
    const earning = await this.cashflowService.getTotalCashflow({
      startDate,
      endDate,
      type: CashflowType.IN,
    });
    const spending = await this.cashflowService.getAllCashflows({
      startDate,
      endDate,
      type: CashflowType.OUT,
    });
    return {
      earning: parseFloat(earning.total),
      spending: spending[0].map((cashflow) => ({
        description: cashflow.descriptions,
        amount: cashflow.amount,
      })),
    };
  }
}
