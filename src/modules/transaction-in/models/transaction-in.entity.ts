import { Customer } from '@app/modules/customer/models/customer.entity';
import { Product } from '@app/modules/product/models/product.entity';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ITransactionIn {
  id: number;
  product: Product;
  productId: number;
  customer: Customer;
  customerId: number;
  qty: number;
  converted_qty: number;
  remaining_qty: number;
  unit: string;
  conversion_to_kg: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('transaction_ins')
export class TransactionIn implements ITransactionIn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.transaction_in)
  customer: Customer;

  @Column()
  customerId: number;

  @ManyToOne(() => Product, (product) => product.transaction_in)
  product: Product;

  @Column()
  productId: number;

  @Column({
    type: 'decimal',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  qty: number;

  @Column({
    type: 'decimal',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  converted_qty: number;

  @Column({
    type: 'decimal',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  remaining_qty: number;

  @Column({
    type: 'decimal',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  final_qty: number;

  @Column({ type: 'varchar' })
  unit: string;

  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  conversion_to_kg: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => TransactionOut,
    (transaction_out) => transaction_out.transaction_inId,
  )
  transaction_out: TransactionOut[];
}
