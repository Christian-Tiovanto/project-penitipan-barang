import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
import { CreateUserRoleDto } from '../dtos/create-user-role.dto copy';
import { UserRole } from '../models/user-role';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async createUserRole(
    createUserRoleDto: CreateUserRoleDto,
  ): Promise<UserRole> {
    let createdUserRole: UserRole;
    try {
      const userRole = this.userRoleRepository.create(createUserRoleDto);
      createdUserRole = await this.userRoleRepository.save(userRole);
    } catch (err) {
      const queryError = err as QueryFailedError & {
        driverError: { errno: ErrorCode; sqlMessage: string };
      };
      if (queryError.driverError.errno === ErrorCode.DUPLICATE_ENTRY) {
        const duplicateValue = new RegExp(RegexPatterns.DuplicateEntry).exec(
          queryError.driverError.sqlMessage,
        );
        throw new ConflictException(`${duplicateValue[1]} value already exist`);
      }
    }
    return createdUserRole;
  }

  async findByUserId(userId: number) {
    const userRoles = await this.userRoleRepository.find({ where: { userId } });
    return userRoles;
  }
  // async deleteUserById(userId: number) {
  //   const user = await this.findUserById(userId);
  //   user.is_deleted = true;
  //   await this.userRepository.save(user);
  // }
}
