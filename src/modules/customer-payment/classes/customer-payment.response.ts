import { ApiProperty } from '@nestjs/swagger';

export class GetCustomerPaymentResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: {
      customer: {
        id: 1,
        name: 'Customer Name',
      },
    },
  })
  customer: {
    id: number;
    name: string;
  };

  @ApiProperty({
    example: {
      payment_method: {
        id: 1,
        name: 'Payment Method Name',
      },
    },
  })
  payment_method: {
    id: number;
    name: string;
  };

  @ApiProperty({
    example: 1000,
  })
  charge: number;

  @ApiProperty({
    example: true,
  })
  status: boolean;

  @ApiProperty({ example: 1000 })
  min_pay: number;
}
