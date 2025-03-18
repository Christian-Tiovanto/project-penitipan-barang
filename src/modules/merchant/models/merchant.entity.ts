import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export interface IMerchant {
  id: number;
  name: string;
  address: string;
  opened_time: Date;
  closed_time: Date;
  phone: string;
  npwp: string;
  nppbkc: string;
  office: string;
  office_code: string;
  bank_name: string;
  bank_account_number: string;
  tax: number;
  logo_name: string;
  created_at: Date;
  updated_at: Date;
}

@Entity('merchants')
@Unique(['bank_name', 'bank_account_number'])
export class Merchant implements IMerchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'timestamp', nullable: true })
  opened_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_time: Date;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar', unique: true })
  npwp: string;

  @Column({ type: 'varchar', unique: true })
  nppbkc: string;

  @Column({ type: 'varchar' })
  office: string;

  @Column({ type: 'varchar' })
  office_code: string;

  @Column({ type: 'varchar' })
  bank_name: string;

  @Column({ type: 'varchar' })
  bank_account_number: string;

  @Column({ type: 'int' })
  tax: number;

  @Column({ type: 'varchar' })
  logo_name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
