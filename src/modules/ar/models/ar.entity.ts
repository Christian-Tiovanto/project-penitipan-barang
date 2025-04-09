import { ArStatus } from '@app/enums/ar-status';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';

export interface IAr {
  id: number;
  customer: number;
  customerId: number;
  invoice: number;
  invoiceId: number;
  ar_no: string;
  total_bill: number;
  to_paid: number;
  status: string;
  paid_date: Date;
  created_at: Date;
  updated_at: Date;
}

@Entity('ar')
export class Ar implements IAr {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.ar)
  customer: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  @OneToOne(() => Invoice, (invoice) => invoice.ar)
  invoice: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  invoiceId: number;

  @ApiProperty({ example: 'Ar No' })
  @Column({ type: 'varchar' })
  ar_no: string;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_bill: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  to_paid: number;

  @ApiProperty({ example: 'pending' })
  @Column({ enum: ArStatus, type: 'enum' })
  status: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @Column({ type: 'datetime', nullable: true })
  paid_date: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
