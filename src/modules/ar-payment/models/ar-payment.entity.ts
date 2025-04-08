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
} from 'typeorm';

export interface IArPayment {
  id: number;
  ar: number;
  arId: number;
  customer_payment: number;
  customer_paymentId: number;
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

  // @ManyToOne(() => Product, (product) => product.product_unit)
  ar: number;

  // @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  arId: number;

  @ManyToOne(() => CustomerPayment, (customerPayment) => customerPayment)
  customer_payment: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customer_paymentId: number;

  @ManyToOne(() => Customer, (customer) => customer)
  customer: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', nullable: true })
  customerId: number;

  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
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
