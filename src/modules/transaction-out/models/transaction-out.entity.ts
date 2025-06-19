import { Customer } from '@app/modules/customer/models/customer.entity';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { Spb } from '@app/modules/spb/models/spb.entity';
import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export interface ITransactionOut {
  id: number;
  product: Product;
  productId: number;
  productName: string;
  customer: Customer;
  customerId: number;
  transaction_in: TransactionIn;
  transaction_inId: number;
  spb: number;
  spbId: number;
  invoice: Invoice;
  invoiceId: number;
  qty: number;
  converted_qty: number;
  conversion_to_kg: number;
  unit: string;
  total_price: number;
  total_fine: number;
  total_charge: number;
  price: number;
  total_days: number;
  is_charge: boolean;
  created_at: Date;
  updated_at: Date;
}

@Entity('transaction_outs')
export class TransactionOut implements ITransactionOut {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Product, (product) => product.transaction_out)
  product: Product;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  productId: number;

  @ApiProperty({ example: 'Apel' })
  @Column({ type: 'varchar', nullable: true })
  productName: string;

  // @ManyToOne(() => Customer, (customer) => customer.transaction_out)
  customer: Customer;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  @ManyToOne(
    () => TransactionIn,
    (transactionIn) => transactionIn.transaction_out,
  )
  transaction_in: TransactionIn;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  transaction_inId: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.transaction_out)
  invoice: Invoice;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  invoiceId: number;

  @ManyToOne(() => Spb, (spb) => spb.transaction_out)
  spb: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  spbId: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  qty: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  converted_qty: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  conversion_to_kg: number;

  @ApiProperty({ example: 'Ball' })
  @Column({ type: 'varchar' })
  unit: string;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_price: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_fine: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_charge: number;

  @ApiProperty({ example: true })
  @Column({
    type: 'boolean',
  })
  is_charge: boolean;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @ApiProperty({ example: 3 })
  @Column({ type: 'int' })
  total_days: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
