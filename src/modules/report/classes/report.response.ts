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
