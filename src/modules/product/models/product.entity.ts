import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IProduct {
  id: number;
  merchant: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  file_name: string;
  qty: number;
  desc: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

@Entity('products')
export class Product implements IProduct {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  merchant: number;

  @ApiProperty({ example: 'Product Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'decimal' })
  price: number;

  @ApiProperty({ example: 'Category Name' })
  @Column({ type: 'varchar' })
  category: string;

  @ApiProperty({ example: 'http://example.com/image.jpg' })
  @Column({ type: 'varchar' })
  image_url: string;

  @ApiProperty({ example: 'filename.jpg' })
  @Column({ type: 'varchar' })
  file_name: string;

  @ApiProperty({ example: 10 })
  @Column({ type: 'float' })
  qty: number;

  @ApiProperty({ example: 'Product description' })
  @Column({ type: 'text' })
  desc: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
