import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IAppSettings {
  id: number;
  setting_name: string;
  setting_value: string;
  created_at: Date;
  updated_at: Date;
}

@Entity('app_settings')
export class AppSetting implements IAppSettings {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'security_pin' })
  @Column({ type: 'varchar' })
  setting_name: string;

  @ApiProperty({ example: '123456' })
  @Column({ type: 'varchar', default: null, nullable: true })
  setting_value: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
