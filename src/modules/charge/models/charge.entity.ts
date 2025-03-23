import { ChargeType } from '@app/enums/charge-type';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ICharge {
  id: number;
  type: string;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('charges')
export class Charge implements ICharge {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ChargeType, type: 'enum' })
  type: string;
  @ApiProperty({ example: 'Payment Method Name' })
  @Column({ type: 'decimal' })
  amount: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
