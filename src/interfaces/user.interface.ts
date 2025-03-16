import { ApiProperty } from '@nestjs/swagger';

export class UserJwtPayload {
  @ApiProperty({ example: '63f5812a399b006117da35f2' })
  _id: string;

  @ApiProperty({ example: 1617782000 })
  iat: number;

  @ApiProperty({ example: 1617785600 })
  exp: number;

  @ApiProperty({ example: 'mobile' })
  type: string;
}

export class JwtTokenResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGYxYzhlYjJhYzQzZTAwNDM2ZWM0MzQiLCJuYW1lIjoiQWRtaW5pc3RyYXRvciIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlX3VzZXIiOiJhZG1pbiIsImlhdCI6MTU3OTY1Njk4MiwiZXhwIjoxNTc5OTE2MTgyfQ.cQ3FcuIQmp3tmwJMFvUldjhP1qgHcyTKreO952zkZ5-RKnI6f-PInWICKxpPrAPXUICNPRc3PvA7E6xE2jC5MmuazFeJqI7Tl-TRzh79sxR4l-gWDY0dqiSkqE3FBtQ1p_HIdOolK2IbqggQzTJM6-DI6JP5OfGcj3eAXkdckb8DaZNSrRDjDOZ-9MIgHf_SW3CcmLQLlZrukWYBYi_Qy_QO21TfkKlNZyLZL_09Gohc_bmit8L_XD0NedQPk3DaH30QtZihA8IBmfS3i08HsaUfgBvvYwxe0c5NGJMOkcyvf_bWdO4YCH0KD0MmPZnPGtnapiEAtGo8-3nBFtCYiA',
  })
  token!: string;
}
