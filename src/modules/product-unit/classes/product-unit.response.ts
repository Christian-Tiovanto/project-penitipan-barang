import { ApiProperty } from '@nestjs/swagger';

export class GetProductUnitResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'unit name',
  })
  name: string;

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
    example: 1000,
  })
  conversion_to_kg: number;
}
