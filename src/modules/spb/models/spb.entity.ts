import { Customer } from '@app/modules/customer/models/customer.entity';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
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

export interface ISpb {
  id: number;
  customer: number;
  customerId: number;
  invoice: number;
  invoiceId: number;
  no_plat: string;
  clock_out: Date;
  created_at: Date;
  updated_at: Date;
}

@Entity('spb')
export class Spb implements ISpb {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.spb)
  customer: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  @OneToOne(() => Invoice, (invoice) => invoice.spb)
  invoice: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  invoiceId: number;

  @ApiProperty({ example: 'Plat No' })
  @Column({ type: 'varchar' })
  no_plat: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Column({ type: 'datetime' })
  clock_out: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TransactionOut, (transaction_out) => transaction_out.spbId)
  transaction_out: TransactionOut[];
}
