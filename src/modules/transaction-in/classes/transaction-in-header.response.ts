import { ApiProperty } from '@nestjs/swagger';
import { TransactionInHeader } from '../models/transaction-in-header.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { TransactionIn } from '../models/transaction-in.entity';
import { Product } from '@app/modules/product/models/product.entity';

export class GetTransactionInHeaderByIdResponse implements TransactionInHeader {
  id: number;
  code: string;
  customer: Pick<Customer, 'id' | 'name'>;
  transaction_in: (Pick<TransactionIn, 'id'> & {
    product: Pick<Product, 'id' | 'name'>;
  })[];
  customerId: number;
  created_at: Date;
  updated_at: Date;
  description: string;
}
