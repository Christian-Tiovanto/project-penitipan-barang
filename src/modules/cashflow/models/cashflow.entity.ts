import { CashflowType } from '@app/enums/cashflow-type';
import { User } from '@app/modules/user/models/user';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export interface ICashflow {
  id: number;
  type: string;
  amount: number;
  total_amount: number;
  created_by: number;
  created_byId?: number;
  created_at: Date;
  updated_at: Date;
}

@Entity('cashflows')
export class Cashflow implements ICashflow {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user)
  created_by: number;

  @ApiProperty({ example: CashflowType.IN })
  @Column({ type: 'enum', enum: CashflowType })
  type: CashflowType;

  @ApiProperty({ example: 20000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @ApiProperty({ example: 50000 })
  @Column({
    type: 'decimal',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_amount: number;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true })
  created_byId: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updated_at: Date;
}
