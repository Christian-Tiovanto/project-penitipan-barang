import { ArPayment } from '@app/modules/ar-payment/models/ar-payment.entity';
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
  JoinColumn,
  OneToMany,
} from 'typeorm';

export interface ICustomerPayment {
  id: number;
  customer: Customer;
  customerId: number;
  payment_method: PaymentMethod;
  payment_methodId: number;
  charge: number;
  min_pay: number;
  // up_price: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

@Entity('customer_payments')
export class CustomerPayment implements ICustomerPayment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Customer, (customer) => customer.customer_payment)
  customer: Customer;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  @ManyToOne(
    () => PaymentMethod,
    (paymentMethod) => paymentMethod.customer_payment,
  )
  @JoinColumn({ name: 'payment_methodId' })
  payment_method: PaymentMethod;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  payment_methodId: number;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  charge: number;

  // @ApiProperty({ example: 1000 })
  // @Column({
  //   type: 'decimal',
  //   transformer: {
  //     to: (value: number) => value,
  //     from: (value: string) => parseFloat(value),
  //   },
  // })
  // up_price: number;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  sort: boolean;

  @ApiProperty({ example: 1000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  min_pay: number;

  @OneToMany(() => ArPayment, (arPayment) => arPayment.customer_payment)
  ar_payment: ArPayment[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
