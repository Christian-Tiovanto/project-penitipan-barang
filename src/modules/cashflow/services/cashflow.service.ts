import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cashflow } from '../models/cashflow.entity';
import { CreateCashflowDto } from '../dtos/create-cashflow.dto';
import { UserService } from '@app/modules/user/services/user.service';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class CashflowService {
  constructor(
    @InjectRepository(Cashflow)
    private readonly cashflowRepository: Repository<Cashflow>,
    private readonly userService: UserService,
  ) {}

  async getAllCashflows({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Cashflow[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const customers = await this.cashflowRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return customers;
  }

  async getCashflowById(customerId: number): Promise<Cashflow> {
    return await this.cashflowRepository.findOne({
      where: { id: customerId },
    });
  }

  async findCashflowById(customerId: number): Promise<Cashflow> {
    const customer = await this.cashflowRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    return customer;
  }

  async createCashflow(
    createCashflowDto: CreateCashflowDto,
  ): Promise<Cashflow> {
    if (createCashflowDto.amount < 1) {
      throw new BadRequestException("Amount can't be less than 0");
    }
    if (createCashflowDto.created_byId) {
      await this.userService.findUserById(createCashflowDto.created_byId);
    }
    const newCashflow = this.cashflowRepository.create(createCashflowDto);
    return await this.cashflowRepository.save(newCashflow);
  }
}
