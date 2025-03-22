import { Merchant } from '@app/modules/merchant/models/merchant.entity';
import { User } from '@app/modules/user/models/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ISupplier {
  id: number;
  merchant: number;
  name: string;
  phone: string;
  is_credit: boolean;
  is_deleted: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('suppliers')
export class Supplier implements ISupplier {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.suppliers)
  merchant: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'bool', default: false })
  is_credit: boolean;

  @Column({ type: 'bool', default: false })
  is_deleted: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  created_by: number;

  @OneToOne(() => User)
  @JoinColumn()
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
