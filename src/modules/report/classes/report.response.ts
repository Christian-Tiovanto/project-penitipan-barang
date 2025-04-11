import { Product } from '@app/modules/product/models/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class StockBookReportResponse {
  initial_qty: number;
  product: Pick<Product, 'id' | 'name'>;
  transactions: {
    date: Date;
    type: string;
    qty: number;
  }[];
  final_qty: number;
}
export class CashflowReportResponse {
  initial_balance: number;
  cashflows: {
    date: Date;
    type: string;
    amount: number;
  }[];
  final_balance: number;
}

export interface IStockReportData {
  product_name: string;
  customer_name: string;
  customerId: number;
  productId: number;
  product_in: number;
  product_out: number;
}

export class StockReportResponse {
  data: IStockReportData[];
}

export class NettIncomeReportResponse {
  @ApiProperty({ example: 20000 })
  earning: number;

  @ApiProperty({
    example: [
      {
        description: 'Cashflow Description',
        amount: 10000,
      },
    ],
  })
  spending: {
    description: string;
    amount: number;
  }[];
}

export interface IStockInvoiceReportData {
  invoiceId: string;
  product_name: string;
  customer_name: string;
  invoice_no: string;
  product_in: number;
  product_out: number;
  product_remaining: number;
  created_at: Date;
}

export class StockInvoiceReportResponse {
  data: IStockInvoiceReportData[];
}
