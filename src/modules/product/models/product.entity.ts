import { ProductUnit } from '@app/modules/product-unit/models/product-unit.entity';
import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export interface IProduct {
  id: number;
  name: string;
  price: number;
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

  @ApiProperty({ example: 'Product Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @ApiProperty({ example: 'http://example.com/image.jpg' })
  @Column({ type: 'varchar' })
  image_url: string;

  @ApiProperty({ example: 'filename.jpg' })
  @Column({ type: 'varchar' })
  file_name: string;

  @ApiProperty({ example: 10 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
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

  @OneToMany(() => TransactionIn, (transaction_in) => transaction_in.productId)
  transaction_in: TransactionIn[];

  @OneToMany(() => TransactionOut, (transaction_out) => transaction_out.productId)
  transaction_out: TransactionOut[];

  @OneToMany(() => ProductUnit, (productUnit) => productUnit.product)
  product_unit: ProductUnit[];
}
