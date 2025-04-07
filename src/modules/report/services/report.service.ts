import { ProductService } from '@app/modules/product/services/product.service';
import { TransactionInService } from '@app/modules/transaction-in/services/transaction-in.service';
import { TransactionOutService } from '@app/modules/transaction-out/services/transaction-out.service';
import { StockBookReportResponse } from '../classes/report.response';
import { Injectable } from '@nestjs/common';
interface StockBookReportQuery {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ReportService {
  constructor(
    private readonly transactionInService: TransactionInService,
    private readonly transactionOutService: TransactionOutService,
    private readonly productService: ProductService,
  ) {}

  async stockBookReport(
    productId: number,
    customerId: number,
    { startDate, endDate }: StockBookReportQuery,
  ) {
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
}
