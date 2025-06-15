export interface AppSetting {
  id: number;
  setting_name: string;
  setting_value: string;
  created_at: Date;
  updated_at: Date;
}

// export class AppSetting implements IAppSettings {
//   @ApiProperty({ example: 1 })
//   id: number;

//   @ApiProperty({ example: 'security_pin' })
//   setting_name: string;

//   @ApiProperty({ example: '123456' })
//   setting_value: string;

//   @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
//   created_at: Date;

//   @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
//   updated_at: Date;
// }
