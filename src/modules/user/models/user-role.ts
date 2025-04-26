import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleEnum } from '@app/enums/user-role';
import { User } from './user';

export interface IUserRole {
  id: number;
  role: UserRoleEnum;
  user: User;
  userId: number;
}

@Unique(['userId', 'role'])
@Entity('user_roles')
export class UserRole implements IUserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.user_role)
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.DEFAULT })
  role: UserRoleEnum;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
