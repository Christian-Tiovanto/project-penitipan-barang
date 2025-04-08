import { ArStatus } from '@app/enums/ar-status';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllArResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    type: Invoice,
  })
  invoice: Invoice;

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

  @ApiProperty({
    example: 'AR-441T1G',
  })
  ar_no: string;

  @ApiProperty({
    example: 100,
  })
  total_bill: number;

  @ApiProperty({
    example: 1000,
  })
  to_paid: number;

  @ApiProperty({ example: ArStatus.COMPLETED, enum: ArStatus })
  status: ArStatus;

  @ApiProperty({ example: new Date() })
  paid_date: Date;
}
