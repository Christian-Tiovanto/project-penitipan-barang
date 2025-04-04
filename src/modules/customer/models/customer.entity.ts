import { Ar } from '@app/modules/ar/models/ar.entity';
import { CustomerPayment } from '@app/modules/customer-payment/models/customer-payment.entity';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { Spb } from '@app/modules/spb/models/spb.entity';
import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
import { TransactionOut } from '@app/modules/transaction-out/models/transaction-out.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export interface ICustomer {
  id: number;
  name: string;
  code: string;
  address: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

@Entity('customers')
export class Customer implements ICustomer {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Customer Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: 'Customer Code' })
  @Column({ type: 'varchar' })
  code: string;

  @ApiProperty({ example: 'Customer Address' })
  @Column({ type: 'varchar' })
  address: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TransactionIn, (transaction_in) => transaction_in.customerId)
  transaction_in: TransactionIn[];

  @OneToMany(() => TransactionOut, (transaction_out) => transaction_out.customerId)
  transaction_out: TransactionOut[];

  @OneToMany(() => Invoice, (invoice) => invoice.customerId)
  invoice: Invoice[];

  @OneToMany(() => Spb, (spb) => spb.customerId)
  spb: Spb[];

  @OneToMany(() => Ar, (ar) => ar.customerId)
  ar: Ar[];

  @OneToMany(
    () => CustomerPayment,
    (customerPayment) => customerPayment.customerId,
  )
  customer_payment: CustomerPayment[];
}
