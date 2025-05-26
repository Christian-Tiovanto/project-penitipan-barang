import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './user-role';

export interface IUser {
  id: number;
  email: string;
  fullname: string;
  password: string;
  user_role: UserRole[];
}

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  fullname: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({
    type: 'varchar',
    // select: false
  })
  password: string;

  // @Column({
  //   type: 'varchar',
  //   // select: false
  // })
  // pin: string;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => UserRole, (UserRole) => UserRole.user)
  user_role: UserRole[];
}
