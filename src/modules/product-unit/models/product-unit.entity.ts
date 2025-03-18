import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IProductUnit {
  id: number;
  product: number;
  name: string;
  qty: number;
  conversion_to_kg: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('product_units')
export class ProductUnit implements IProductUnit {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  product: number;

  @ApiProperty({ example: 'Product-unit Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'decimal' })
  qty: number;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'decimal' })
  conversion_to_kg: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
