import { ApiProperty } from '@nestjs/swagger';

export class GetProductResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'product name',
  })
  name: string;

  @ApiProperty({
    example: 5000,
  })
  price: number;

  @ApiProperty({ example: 5 })
  qty: number;

  @ApiProperty({ example: 'description' })
  desc: string;
}
