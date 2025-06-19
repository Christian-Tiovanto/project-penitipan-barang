import { InvoiceStatus } from '@app/enums/invoice-status';
import { Ar } from '@app/modules/ar/models/ar.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Spb } from '@app/modules/spb/models/spb.entity';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';

export interface IInvoice {
  id: number;
  customer: number;
  customerId: number;
  invoice_no: string;
  total_amount: number;
  charge: number;
  fine: number;
  discount: number;
  total_order: number;
  total_order_converted: number;
  tax: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Entity('invoices')
export class Invoice implements IInvoice {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Customer, (customer) => customer.invoice)
  customer: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  @ApiProperty({ example: 'Invoice No' })
  @Column({ type: 'varchar' })
  invoice_no: string;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_amount: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  charge: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  fine: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discount: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_order: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_order_converted: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  tax: number;

  @ApiProperty({ example: 'pending' })
  @Column({ enum: InvoiceStatus, type: 'enum' })
  status: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => TransactionOut,
    (transaction_out) => transaction_out.invoiceId,
  )
  transaction_out: TransactionOut[];

  @OneToOne(() => Ar, (ar) => ar.invoiceId)
  ar: Ar[];

  @OneToOne(() => Spb, (spb) => spb.invoiceId)
  spb: Spb;
}
