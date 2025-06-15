import { UserRoleEnum } from '@app/enums/user-role';
import { User } from './user';

export interface UserRole {
  id: number;
  role: UserRoleEnum;
  user: User;
  userId: number;
  created_at: Date;
  updated_at: Date;
}

// @Unique(['userId', 'role'])
// @Entity('user_roles')
// export class UserRole implements IUserRole {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => User, (user) => user.user_role)
//   user: User;

//   @Column({ type: 'int' })
//   userId: number;

//   @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.DEFAULT })
//   role: UserRoleEnum;

//   @CreateDateColumn()
//   created_at: Date;

//   @UpdateDateColumn()
//   updated_at: Date;
// }
