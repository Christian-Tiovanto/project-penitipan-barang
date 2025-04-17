import { ApiProperty } from '@nestjs/swagger';
import { TransactionOut } from '../models/transaction-out.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';

export class GetTransactionOutResponse
  implements Pick<TransactionOut, 'id' | 'converted_qty' | 'total_days'>
{
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: {
      product: {
        id: 1,
        name: 'Product Name',
      },
    },
  })
  product: Pick<Product, 'id' | 'name'>;

  @ApiProperty({
    example: {
      id: 1,
      name: 'Customer Name',
    },
  })
  customer: Pick<Customer, 'id' | 'name'>;

  @ApiProperty({
    example: {
      id: 1,
      invoice_no: 'Customer Name',
    },
  })
  invoice: Pick<Invoice, 'id' | 'invoice_no'>;

  @ApiProperty({
    example: 1000,
  })
  converted_qty: number;

  @ApiProperty({ example: 30 })
  total_days: number;
}
