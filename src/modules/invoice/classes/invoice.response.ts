import { ArStatus } from '@app/enums/ar-status';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllInvoiceResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'OK-123412KG',
  })
  invoice_no: string;

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

  @ApiProperty({ example: 500 })
  charge: number;

  @ApiProperty({ example: 5000 })
  fine: number;

  @ApiProperty({ example: 5000 })
  discount: number;

  @ApiProperty({ example: 5000 })
  total_order: number;

  @ApiProperty({ example: 5000 })
  total_order_converted: number;

  @ApiProperty({ example: 5000 })
  tax: number;

  @ApiProperty({
    example: 100,
  })
  total_amount: number;

  @ApiProperty({ example: ArStatus.COMPLETED, enum: ArStatus })
  status: ArStatus;

  @ApiProperty({ example: new Date() })
  created_at: Date;
}
