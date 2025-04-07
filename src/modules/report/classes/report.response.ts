import { Product } from '@app/modules/product/models/product.entity';

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
