import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IMerchantPayment {
  id: number;
  merchant: number;
  payment_method: number,
  charge: number;
  up_price: number;
  status: boolean;
  sort: boolean,
  min_pay: number,
  created_at: Date;
  updated_at: Date;
}

@Entity('merchant_payments')
export class MerchantPayment implements IMerchantPayment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  merchant: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  payment_method: number;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'float' })
  charge: number;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'decimal' })
  up_price: number;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  sort: boolean;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'float' })
  min_pay: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
