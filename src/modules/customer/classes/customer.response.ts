import { ApiProperty } from '@nestjs/swagger';

export class GetCustomerResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'name',
  })
  name: string;

  @ApiProperty({
    example: 'abc',
  })
  code: string;

  @ApiProperty({ example: 'jl megamas' })
  address: string;
}
