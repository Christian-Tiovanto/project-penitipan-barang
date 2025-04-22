import { CustomerPayment } from '@app/modules/customer-payment/models/customer-payment.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export interface IPaymentMethod {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

@Entity('payment_methods')
export class PaymentMethod implements IPaymentMethod {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Payment Method Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => CustomerPayment,
    (customerPayment) => customerPayment.payment_method,
  )
  customer_payment: CustomerPayment[];
}
