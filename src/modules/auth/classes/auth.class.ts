import { ApiProperty } from '@nestjs/swagger';

export class JwtTokenResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNocmlzdGlhbnRpb3ZhbnRvMUBnbWFpbC5jb20iLCJpZCI6NjksImlhdCI6MTcyMzQzMjcwOH0.aKgsxaNAYjPzv0W2cH3PKlNQANcEuTRp-eQYDoMVDbo',
  })
  token: string;

  @ApiProperty({ example: 'Login successfull' })
  message: string;
}
