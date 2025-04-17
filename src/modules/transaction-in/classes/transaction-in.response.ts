import { ApiProperty } from '@nestjs/swagger';
import { TransactionInHeader } from '../models/transaction-in-header.entity';

export class GetTransactionInResponse {
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
  product: {
    id: number;
    name: string;
  };

  @ApiProperty({
    example: {
      id: 1,
      name: 'Customer Name',
    },
  })
  customer: {
    id: number;
    name: string;
  };

  transaction_in_header: {
    id: number;
    code: string;
  };

  @ApiProperty({
    example: 100,
  })
  qty: number;

  @ApiProperty({
    example: 1000,
  })
  converted_qty: number;

  @ApiProperty({ example: 'Kg' })
  unit: string;

  @ApiProperty({ example: { code: 'CO-00001' } })
  transaction_in_header: Pick<TransactionInHeader, 'code'>;

  created_at: Date;
}
