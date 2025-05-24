import { Customer } from '@app/modules/customer/models/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionIn } from './transaction-in.entity';

export interface ITransactionInHeader {
  id: number;
  code: string;
  customer: Customer;
  customerId: number;
  created_at: Date;
  updated_at: Date;
  desc: string;
}

@Entity('transaction_in_header')
export class TransactionInHeader implements ITransactionInHeader {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.transaction_in)
  customer: Customer;

  @Column({ type: 'varchar', nullable: true })
  code: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => TransactionIn,
    (transaction_in) => transaction_in.transaction_in_header,
  )
  transaction_in: TransactionIn[];

  @Column()
  customerId: number;

  @Column({ type: 'varchar', nullable: true })
  desc: string;
}
