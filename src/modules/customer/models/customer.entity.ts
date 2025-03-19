import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ICustomer {
  id: number;
  merchant: number;
  name: string;
  address: string;
  identity: string;
  identity_number: string;
  office: string;
  office_code: string;
  is_credit: boolean;
  is_deleted: boolean;
  created_by: number
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('customers')
export class Customer implements ICustomer {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  merchant: number;

  @ApiProperty({ example: 'Customer Name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ example: 'Customer Address' })
  @Column({ type: 'varchar' })
  address: string;

  @ApiProperty({ example: 'Customer Identity' })
  @Column({ type: 'varchar' })
  identity: string;

  @ApiProperty({ example: 'Customer Identity Number' })
  @Column({ type: 'varchar' })
  identity_number: string;

  @ApiProperty({ example: 'Customer Office' })
  @Column({ type: 'varchar' })
  office: string;

  @ApiProperty({ example: 'Customer Office Code' })
  @Column({ type: 'varchar' })
  office_code: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean' })
  is_credit: boolean;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  created_by: number;

  @ApiProperty({ example: 1 })
  @Column({ type: 'decimal' })
  updated_by: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
