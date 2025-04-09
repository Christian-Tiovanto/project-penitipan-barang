import { ApiProperty } from '@nestjs/swagger';

export class GetPaymentMethodResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'BCA',
  })
  name: string;
}
