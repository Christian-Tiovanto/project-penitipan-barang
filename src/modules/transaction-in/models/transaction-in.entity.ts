import { Customer } from '@app/modules/customer/models/customer.entity';
import { Product } from '@app/modules/product/models/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ITransactionIn {
  id: number;
  product: number;
  productId: number;
  customer: number;
  customerId: number;
  qty: number;
  converted_qty: number;
  remaining_qty: number;
  unit: string;
  conversion_to_kg: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('transaction-ins')
export class TransactionIn implements ITransactionIn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.transaction_in)
  customer: number;

  @Column()
  customerId: number;

  @ManyToOne(() => Product, (product) => product.transaction_in)
  product: number;

  @Column()
  productId: number;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @Column({ type: 'int', default: 0 })
  converted_qty: number;

  @Column({ type: 'int', default: 0 })
  remaining_qty: number;

  @Column({ type: 'int', default: 0 })
  final_qty: number;

  @Column({ type: 'varchar' })
  unit: string;

  @Column({ type: 'int' })
  conversion_to_kg: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
