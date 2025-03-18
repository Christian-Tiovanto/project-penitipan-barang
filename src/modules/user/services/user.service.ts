import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/user';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dtos/update-user.dto';

interface GetAllUserQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    let createdUser: User;
    try {
      const user = this.userRepository.create(createUserDto);
      createdUser = await this.userRepository.save(user);
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
    delete createdUser.password;
    return createdUser;
  }
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, is_deleted: false },
      select: ['id', 'fullname', 'password', 'role'],
    });
    return user;
  }
  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, is_deleted: false },
    });
    return user;
  }

  async getAllUser({ pageNo, pageSize }: GetAllUserQuery) {
    const skip = (pageNo - 1) * pageSize;
    const users = await this.userRepository.findAndCount({
      skip,
      take: pageSize,
      where: {
        is_deleted: false,
      },
    });
    return users;
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, is_deleted: false },
    });
    if (!user) throw new NotFoundException('No user with that id');
    return user;
  }
  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, is_deleted: false },
      select: ['id', 'fullname', 'password', 'role'],
    });
    if (!user) throw new NotFoundException('No User with that Email');
    return user;
  }

  async updateUserPassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = await this.getUserById(userId);
    user.password = await bcrypt.hash(updatePasswordDto.password, 10);
    await this.userRepository.save(user);
    delete user.password;
    return user;
  }

  async updateUserById(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUserById(userId);
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
    return user;
  }

  async deleteUserById(userId: number) {
    const user = await this.findUserById(userId);
    user.is_deleted = true;
    await this.userRepository.save(user);
  }
}
