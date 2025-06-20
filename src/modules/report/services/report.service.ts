// import { ProductService } from '@app/modules/product/services/product.service';
// import { TransactionInService } from '@app/modules/transaction-in/services/transaction-in.service';
// import { TransactionOutService } from '@app/modules/transaction-out/services/transaction-out.service';
// import {
//   CashflowReportResponse,
//   CustomerProductMutationReport,
//   IStockReportData,
//   NettIncomeReportResponse,
//   StockBookReportResponse,
// } from '../classes/report.response';
// import { Injectable } from '@nestjs/common';
// import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
// import { Repository } from 'typeorm';
// import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CashflowService } from '@app/modules/cashflow/services/cashflow.service';
// import { CashflowType } from '@app/enums/cashflow-type';
// import { ArService } from '@app/modules/ar/services/ar.service';
// import { ArSort, SortOrder } from '@app/enums/sort-order';
// import { ArStatus } from '@app/enums/ar-status';
// import {
//   Cashflow,
//   CashflowFrom,
// } from '@app/modules/cashflow/models/cashflow.entity';
// import { ProductUnitService } from '@app/modules/product-unit/services/product-unit.service';
// interface StockBookReportQuery {
//   startDate: Date;
//   endDate: Date;
// }
// interface CostReportQuery {
//   startDate: Date;
//   endDate: Date;
//   from?: 'in' | 'out';
// }
// interface CustomerProductMutationReportQuery {
//   startDate: Date;
//   endDate: Date;
// }
// interface NettIncomeReportQuery {
//   startDate: Date;
//   endDate: Date;
// }

// interface ArPaidReportQuery {
//   pageNo: number;
//   pageSize: number;
//   sort?: ArSort;
//   order?: SortOrder;
//   startDate?: Date;
//   endDate?: Date;
//   compact?: boolean;
//   customer?: string;
//   with_payment?: boolean;
//   status?: ArStatus;
// }
// @Injectable()
// export class ReportService {
//   constructor(
//     private readonly arService: ArService,
//     private readonly transactionInService: TransactionInService,
//     private readonly transactionOutService: TransactionOutService,
//     private readonly productService: ProductService,
//     private readonly productUnitService: ProductUnitService,
//     private readonly cashflowService: CashflowService,
//     @InjectRepository(TransactionIn)
//     private readonly transactionInRepository: Repository<TransactionIn>,
//     @InjectRepository(TransactionOut)
//     private readonly transactionOutRepository: Repository<TransactionOut>,
//   ) {}

//   async stockBookReport(
//     productId: number,
//     customerId: number,
//     { startDate, endDate }: StockBookReportQuery,
//   ): Promise<StockBookReportResponse> {
//     const product = await this.productService.findProductById(productId);
//     const sumInQty = await this.transactionInService.sumCustProductQty(
//       productId,
//       customerId,
//       startDate,
//     );
//     const sumOutQty = await this.transactionOutService.sumCustProductQty(
//       productId,
//       customerId,
//       startDate,
//     );
//     const { totalSum: totalSumIn, transactionsIns } =
//       await this.transactionInService.getTransactionInForStockBookReport(
//         productId,
//         customerId,
//         startDate,
//         endDate,
//       );
//     const { totalSum: totalSumOut, transactionOuts } =
//       await this.transactionOutService.getTransactionOutForStockBookReport(
//         productId,
//         customerId,
//         startDate,
//         endDate,
//       );
//     const allTransactions = [
//       ...transactionsIns.map((value) => ({ ...value, type: 'Add' })),
//       ...transactionOuts.map((value) => ({ ...value, type: 'Out' })),
//     ];
//     allTransactions.sort(
//       (a, b) => a.created_at.getTime() - b.created_at.getTime(),
//     );
//     const data: StockBookReportResponse = {
//       initial_qty: sumInQty - sumOutQty + product.initial_qty,
//       final_qty:
//         product.initial_qty + sumInQty + totalSumIn - sumOutQty - totalSumOut,
//       product: { id: product.id, name: product.name },
//       transactions: [
//         ...allTransactions.map((value) => {
//           return {
//             date: value.created_at,
//             type: value.type,
//             qty: value.converted_qty,
//           };
//         }),
//       ],
//     };
//     return data;
//   }

//   async stockInvoiceReport(invoiceId?: number) {
//     let query = `
//     SELECT
//       b.invoiceId,
//       a.invoice_no,
//       d.name as product_name,
//       e.name as customer_name,
//       SUM(b.converted_qty) AS product_out,
//       c.converted_qty AS product_in,
//       c.remaining_qty AS product_remaining,
//       a.created_at
//     FROM invoices a
//     INNER JOIN transaction_outs b ON a.id = b.invoiceId
//     INNER JOIN transaction_ins c ON b.transaction_inid = c.id AND b.productId = c.productId AND b.customerId = c.customerId
//     INNER JOIN products d ON b.productId = d.id
//     INNER JOIN customers e ON b.customerId = e.id`;

//     const params = [];
//     if (invoiceId) {
//       query += ` WHERE a.id = ?`;
//       params.push(invoiceId);
//     }

//     query += `
//     GROUP BY
//       d.name,
//       e.name,
//       b.invoiceId,
//       a.invoice_no,
//       c.remaining_qty,
//       c.converted_qty,
//       a.created_at
//   `;
//     return await this.transactionInRepository.query(query, params);
//   }

//   async agingReport(customerId?: number) {
//     let query = `
//     SELECT c.name as product_name, a.created_at, b.code, CAST(a.remaining_qty AS DECIMAL(10,2)) as remaining_qty
//     , a.conversion_to_kg , a.unit, d.name as customer_name
//     FROM transaction_ins a
//     LEFT JOIN transaction_in_header b ON a.transaction_in_headerid = b.id
//     LEFT JOIN products c ON a.productId = c.id
//     LEFT JOIN customers d ON b.customerId = d.id`;

//     const params = [];
//     if (customerId) {
//       query += ` WHERE b.customerId = ?`;
//       params.push(customerId);
//     }

//     return await this.transactionInRepository.query(query, params);
//   }

//   async cashflowReport({
//     startDate,
//     endDate,
//     from,
//   }: CostReportQuery): Promise<CashflowReportResponse> {
//     // const initialBalance = await this.cashflowService.getInitialBalance({
//     //   endDate: startDate,
//     // });
//     const initialBalance = 0;
//     let cashflowsIn: Cashflow[] = [];
//     let cashflowsOut: Cashflow[] = [];
//     let sumCashflowIn = 0;
//     let sumCashflowOut = 0;
//     if (!from) {
//       cashflowsIn = (
//         await this.cashflowService.getAllCashflows({
//           startDate,
//           endDate,
//           type: CashflowType.IN,
//         })
//       )[0];
//       sumCashflowIn = await this.cashflowService.getTotalSumAmount({
//         startDate,
//         endDate,
//         type: CashflowType.IN,
//       });

//       cashflowsOut = (
//         await this.cashflowService.getAllCashflows({
//           startDate,
//           endDate,
//           type: CashflowType.OUT,
//         })
//       )[0];
//       sumCashflowOut = await this.cashflowService.getTotalSumAmount({
//         startDate,
//         endDate,
//         type: CashflowType.OUT,
//       });
//     } else if (from === 'in') {
//       cashflowsIn = (
//         await this.cashflowService.getAllCashflows({
//           startDate,
//           endDate,
//           type: CashflowType.IN,
//         })
//       )[0];
//       sumCashflowIn = await this.cashflowService.getTotalSumAmount({
//         startDate,
//         endDate,
//         type: CashflowType.IN,
//       });
//     } else if (from === 'out') {
//       cashflowsOut = (
//         await this.cashflowService.getAllCashflows({
//           startDate,
//           endDate,
//           type: CashflowType.OUT,
//         })
//       )[0];
//       sumCashflowOut = await this.cashflowService.getTotalSumAmount({
//         startDate,
//         endDate,
//         type: CashflowType.OUT,
//       });
//     }
//     const allCashflows = [...cashflowsIn, ...cashflowsOut];
//     allCashflows.sort(
//       (a, b) => a.created_at.getTime() - b.created_at.getTime(),
//     );
//     const data: CashflowReportResponse = {
//       initial_balance: initialBalance,
//       final_balance: initialBalance + sumCashflowIn - sumCashflowOut,
//       cashflows: [
//         ...allCashflows.map((value) => {
//           return {
//             date: value.created_at,
//             type: value.type,
//             amount: value.amount,
//             desc: value.descriptions,
//           };
//         }),
//       ],
//     };
//     return data;
//   }

//   async stockReport(endDate: Date, customerId?: number) {
//     const [inResults, outResults] = await Promise.all([
//       this.transactionInService.getTransactionForStockReport({
//         endDate,
//         customerId,
//       }),
//       this.transactionOutService.getTransactionForStockReport({
//         endDate,
//         customerId,
//       }),
//     ]);

//     const combinedMap = new Map<string, IStockReportData>();

//     // Create unique key for grouping
//     const getKey = (customerId: number, productId: number) =>
//       `${customerId}-${productId}`;

//     // Process IN results
//     inResults.forEach((item) => {
//       const key = getKey(item.customerId, item.productId);
//       combinedMap.set(key, {
//         customerId: item.customerId,
//         productId: item.productId,
//         customer_name: item.customer_name,
//         product_name: item.product_name,
//         product_in: Number(item.total_qty),
//         product_out: 0,
//       });
//     });

//     // Process OUT results
//     outResults.forEach((item) => {
//       const key = getKey(item.customerId, item.productId);
//       if (combinedMap.has(key)) {
//         combinedMap.get(key).product_out = Number(item.total_qty);
//       } else {
//         combinedMap.set(key, {
//           customerId: item.customerId,
//           productId: item.productId,
//           customer_name: item.customer_name,
//           product_name: item.product_name,
//           product_in: 0,
//           product_out: Number(item.total_qty),
//         });
//       }
//     });
//     return Array.from(combinedMap.values());
//   }

//   async nettIncomeReport({
//     startDate,
//     endDate,
//   }: NettIncomeReportQuery): Promise<NettIncomeReportResponse> {
//     const earningFromInput = await this.cashflowService.getTotalCashflow({
//       startDate,
//       endDate,
//       type: CashflowType.IN,
//       from: CashflowFrom.INPUT,
//     });
//     const earningFromAr = await this.arService.getTotalBills({
//       startDate,
//       endDate,
//     });

//     const spendings = await this.cashflowService.getAllCashflows({
//       startDate,
//       endDate,
//       type: CashflowType.OUT,
//     });
//     return {
//       earning: {
//         input: parseFloat(earningFromInput.total),
//         payment: parseFloat(earningFromAr.total),
//       },
//       spending: spendings[0].map((cashflow) => ({
//         description: cashflow.descriptions,
//         amount: cashflow.amount,
//       })),
//     };
//   }

//   async arList({
//     sort,
//     order,
//     startDate,
//     endDate,
//     pageNo,
//     pageSize,
//     compact,
//     customer,
//     status,
//     with_payment,
//   }: ArPaidReportQuery) {
//     return await this.arService.getAllArs({
//       pageNo,
//       pageSize,
//       startDate,
//       endDate,
//       sort,
//       order,
//       compact,
//       customer,
//       with_payment,
//       status,
//     });
//   }

//   async arPaidReport({
//     sort,
//     order,
//     startDate,
//     endDate,
//     pageNo,
//     pageSize,
//     compact,
//     customer,
//     status,
//     with_payment,
//   }: ArPaidReportQuery) {
//     return await this.arService.arPaidReport({
//       pageNo,
//       pageSize,
//       startDate,
//       endDate,
//       sort,
//       order,
//       compact,
//       customer,
//       with_payment,
//       status,
//     });
//   }

//   async arToPaidReport({
//     sort,
//     order,
//     startDate,
//     endDate,
//     pageNo,
//     pageSize,
//     compact,
//     customer,
//     status,
//     with_payment,
//   }: ArPaidReportQuery) {
//     return await this.arService.arToPaidReport({
//       pageNo,
//       pageSize,
//       startDate,
//       endDate,
//       sort,
//       order,
//       compact,
//       customer,
//       with_payment,
//       status,
//     });
//   }

//   async arMixedReport({
//     sort,
//     order,
//     startDate,
//     endDate,
//     pageNo,
//     pageSize,
//     compact,
//     customer,
//     status,
//     with_payment,
//   }: ArPaidReportQuery) {
//     return await this.arService.arMixedReport({
//       pageNo,
//       pageSize,
//       startDate,
//       endDate,
//       sort,
//       order,
//       compact,
//       customer,
//       with_payment,
//       status,
//     });
//   }

//   async customerProductMutationReport(
//     customerId: number,
//     { startDate, endDate }: CustomerProductMutationReportQuery,
//   ) {
//     const queryBefore = `SELECT
//     DATE(all_records.date) as date,
//     all_records.productId,
//     products.name,
//     COALESCE(transaction_ins.totals, 0) AS qty_in,
//     COALESCE(transaction_outs.totals, 0) AS qty_out
// FROM (
//     SELECT DISTINCT
//         DATE(created_at) AS date,
//         productId
//     FROM (
//         -- Get base records from BOTH tables with date filter
//         SELECT created_at, productId
//         FROM transaction_ins
//         WHERE customerId = ${customerId}
//           AND created_at < "${startDate}"   -- END DATE + 1 DAY
//           AND productId > 0
//         UNION ALL
//         SELECT created_at, productId
//         FROM transaction_outs
//         WHERE customerId = ${customerId}
//           AND created_at < "${startDate}"   -- END DATE + 1 DAY
//           AND productId > 0
//     ) AS combined_records
// ) AS all_records
// LEFT JOIN products on all_records.productId = products.id
// LEFT JOIN (
//     -- Aggregated ins with date filter
//     SELECT
//         DATE(created_at) AS date,
//         productId,
//         SUM(qty) AS totals
//     FROM transaction_ins
//     WHERE customerId = ${customerId}
//       AND created_at < "${startDate}"
//       AND productId > 0
//     GROUP BY DATE(created_at), productId
// ) AS transaction_ins
//     ON all_records.date = transaction_ins.date
//     AND all_records.productId = transaction_ins.productId
// LEFT JOIN (
//     -- Aggregated outs with date filter
//     SELECT
//         DATE(created_at) AS date,
//         productId,
//         SUM(qty) AS totals
//     FROM transaction_outs
//     WHERE customerId = ${customerId}
//       AND created_at < "${startDate}"
//       AND productId > 0
//     GROUP BY DATE(created_at), productId
// ) AS transaction_outs
//     ON all_records.date = transaction_outs.date
//     AND all_records.productId = transaction_outs.productId
// ORDER BY all_records.date, all_records.productId;`;

//     const query = `SELECT
//     DATE(all_records.date) as date,
//     all_records.productId,
//     products.name,
//     COALESCE(transaction_ins.totals, 0) AS qty_in,
//     COALESCE(transaction_outs.totals, 0) AS qty_out
// FROM (
//     SELECT DISTINCT
//         DATE(created_at) AS date,
//         productId
//     FROM (
//         -- Get base records from BOTH tables with date filter
//         SELECT created_at, productId
//         FROM transaction_ins
//         WHERE customerId = ${customerId}
//           AND created_at >= "${startDate}"  -- START DATE
//           AND created_at < "${endDate}"   -- END DATE + 1 DAY
//           AND productId > 0
//         UNION ALL
//         SELECT created_at, productId
//         FROM transaction_outs
//         WHERE customerId = ${customerId}
//           AND created_at >= "${startDate}"  -- START DATE
//           AND created_at < "${endDate}"   -- END DATE + 1 DAY
//           AND productId > 0
//     ) AS combined_records
// ) AS all_records
// LEFT JOIN products on all_records.productId = products.id
// LEFT JOIN (
//     -- Aggregated ins with date filter
//     SELECT
//         DATE(created_at) AS date,
//         productId,
//         SUM(qty) AS totals
//     FROM transaction_ins
//     WHERE customerId = ${customerId}
//       AND created_at >= "${startDate}"
//       AND created_at < "${endDate}"
//       AND productId > 0
//     GROUP BY DATE(created_at), productId
// ) AS transaction_ins
//     ON all_records.date = transaction_ins.date
//     AND all_records.productId = transaction_ins.productId
// LEFT JOIN (
//     -- Aggregated outs with date filter
//     SELECT
//         DATE(created_at) AS date,
//         productId,
//         SUM(qty) AS totals
//     FROM transaction_outs
//     WHERE customerId = ${customerId}
//       AND created_at >= "${startDate}"
//       AND created_at < "${endDate}"
//       AND productId > 0
//     GROUP BY DATE(created_at), productId
// ) AS transaction_outs
//     ON all_records.date = transaction_outs.date
//     AND all_records.productId = transaction_outs.productId
// ORDER BY all_records.date, all_records.productId;`;
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const dataBefore: CustomerProductMutationReport[] =
//       await this.transactionInRepository.query(queryBefore);

//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const data: CustomerProductMutationReport[] =
//       await this.transactionInRepository.query(query);

//     const dataBeforeMap = new Map<number, CustomerProductMutationReport[]>();
//     for (const row of dataBefore) {
//       const parsedRow = {
//         ...row,
//         qty_in: Number(row.qty_in),
//         qty_out: Number(row.qty_out),
//       };

//       const arr = dataBeforeMap.get(parsedRow.productId);
//       if (arr) {
//         arr.push(parsedRow);
//       } else {
//         dataBeforeMap.set(parsedRow.productId, [parsedRow]);
//       }
//     }
//     const initialStockMap = new Map<number, number>();

//     for (const [key, value] of dataBeforeMap) {
//       let initialStock = 0;
//       for (const productTrans of value) {
//         initialStock =
//           initialStock +
//           Number(productTrans.qty_in) -
//           Number(productTrans.qty_out);
//       }
//       initialStockMap.set(key, initialStock);
//     }

//     const mutationDataMap = new Map<number, CustomerProductMutationReport[]>();
//     console.log(data);
//     for (const row of data) {
//       const parsedRow = {
//         ...row,
//         qty_in: Number(row.qty_in),
//         qty_out: Number(row.qty_out),
//       };

//       const arr = mutationDataMap.get(parsedRow.productId);
//       if (arr) {
//         arr.push(parsedRow);
//       } else {
//         mutationDataMap.set(parsedRow.productId, [parsedRow]);
//       }
//     }
//     const productNotInMutationDataMap = new Map<
//       number,
//       CustomerProductMutationReport[]
//     >();
//     for (const [key, value] of dataBeforeMap) {
//       if (!mutationDataMap.get(key)) {
//         productNotInMutationDataMap.set(key, []);
//       }
//     }
//     return await Promise.all(
//       Array.from(
//         // Combine keys from both maps
//         new Set([...mutationDataMap.keys(), ...dataBeforeMap.keys()]),
//       ).map(async (productId) => {
//         // Get records from mutation data or empty array
//         const records = mutationDataMap.get(productId) || [];

//         // Get product name from either dataset
//         const productName =
//           records[0]?.name ||
//           dataBeforeMap.get(productId)?.[0]?.name ||
//           'Unknown';
//         return {
//           productId,
//           productName,
//           initialValue: initialStockMap.get(productId) ?? 0,
//           records,
//         };
//       }),
//     );
//   }
// }
