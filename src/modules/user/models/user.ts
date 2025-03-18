import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@app/enums/user-role';

export interface IUser {
  id: number;
  merchant: number;
  role: UserRole;
  email: string;
  fullname: string;
  password: string;
  address: string;
  phone: string;
}

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  merchant: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.DEFAULT })
  role: UserRole;

  @Column({ type: 'varchar' })
  fullname: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
