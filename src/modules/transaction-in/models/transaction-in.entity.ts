import { Merchant } from '@app/modules/merchant/models/merchant.entity';
import { ProductUnit } from '@app/modules/product-unit/models/product-unit.entity';
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
  merchant: number;
  product: number;
  qty: number;
  remaining_qty: number;
  final_qty: number;
  price: number;
  unit: number;
  unit_name: string;
  conversion_to_kg: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('transaction-ins')
export class TransactionIn implements ITransactionIn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.transaction_in)
  merchant: number;

  @ManyToOne(() => Product, (product) => product.transaction_in)
  product: number;

  @Column({ type: 'int', default: 0 })
  qty: number;

  @Column({ type: 'int', default: 0 })
  remaining_qty: number;

  @Column({ type: 'int', default: 0 })
  final_qty: number;

  @Column({ type: 'int' })
  price: number;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit)
  unit: number;

  @Column({ type: 'varchar' })
  unit_name: string;

  @Column({ type: 'int' })
  conversion_to_kg: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
