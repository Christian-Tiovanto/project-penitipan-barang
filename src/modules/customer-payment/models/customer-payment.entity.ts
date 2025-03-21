import { Customer } from '@app/modules/customer/models/customer.entity';
import { PaymentMethod } from '@app/modules/payment-method/models/payment-method.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export interface ICustomerPayment {
  id: number;
  customer: number;
  customerId: number;
  payment_method: number;
  payment_methodId: number;
  charge: number;
  min_pay: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

@Entity('customer_payments')
export class CustomerPayment implements ICustomerPayment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.customer_payment)
  customer: number;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true })
  customerId: number;

  @ApiProperty({ example: 1 })
  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod)
  payment_method: number;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true })
  payment_methodId: number;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'float' })
  charge: number;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'decimal' })
  up_price: number;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  sort: boolean;

  @ApiProperty({ example: 1000 })
  @Column({ type: 'float' })
  min_pay: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
