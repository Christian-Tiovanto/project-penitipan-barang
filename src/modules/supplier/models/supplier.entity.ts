import {
  Column,
  CreateDateColumn,
  Entity,
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

@Entity()
export class Supplier implements ISupplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  merchant: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'bool', default: false })
  is_credit: boolean;

  @Column({ type: 'bool', default: false })
  is_deleted: boolean;

  @Column({ type: 'int' })
  created_by: number;

  @Column({ type: 'int', default: false })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
