import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IFine {
  id: number;
  name: string;
  type: string;
  value: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('fines')
export class Fine implements IFine {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Fine Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: 'Type Name' })
  @Column({ type: 'varchar' })
  type: string;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'float' })
  value: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
