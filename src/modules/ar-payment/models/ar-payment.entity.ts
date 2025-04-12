import { Ar } from '@app/modules/ar/models/ar.entity';
import { CustomerPayment } from '@app/modules/customer-payment/models/customer-payment.entity';
import { Customer } from '@app/modules/customer/models/customer.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export interface IArPayment {
  id: number;
  ar: number;
  arId: number;
  customer_payment: number;
  customer_paymentId: number;
  payment_method_name: string;
  customer: number;
  customerId: number;
  total_paid: number;
  reference_no: string;
  transfer_date: Date;
  created_at: Date;
  updated_at: Date;
}

@Entity('ar_payment')
export class ArPayment implements IArPayment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ar, (ar) => ar.ar_payment)
  ar: number;

  // @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  arId: number;

  @JoinColumn({ name: 'customer_paymentId' })
  @ManyToOne(() => CustomerPayment, (customerPayment) => customerPayment)
  customer_payment: number;

  @ApiProperty({ example: 'Cash' })
  @Column({ type: 'varchar' })
  payment_method_name: string;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customer_paymentId: number;

  @ManyToOne(() => Customer, (customer) => customer)
  customer: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  // @Column({
  //   type: 'decimal',
  //   precision: 15,
  //   scale: 5,
  //   transformer: {
  //     to: (value: number) => value,
  //     from: (value: string) => parseFloat(value),
  //   },
  // })
  @ApiProperty({ example: 1000 })
  @Column({
    type: 'int',
  })
  total_paid: number;

  @Column({ type: 'timestamp' })
  transfer_date: Date;

  @Column({ type: 'varchar' })
  reference_no: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
