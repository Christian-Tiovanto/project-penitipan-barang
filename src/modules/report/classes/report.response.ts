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
