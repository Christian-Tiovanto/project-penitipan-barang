import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'John Doe',
  })
  fullname: string;

  @ApiProperty({ example: 'test@gmail.com' })
  email: string;

  // @ApiProperty({ example: '54321' })
  // pin: string;
}
