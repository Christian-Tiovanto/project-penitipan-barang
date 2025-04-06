import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Cashflow } from '../models/cashflow.entity';
import { CreateCashflowDto } from '../dtos/create-cashflow.dto';
import { UserService } from '@app/modules/user/services/user.service';
import { CashflowType } from '@app/enums/cashflow-type';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
  startDate?: Date;
  endDate?: Date;
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
    startDate,
    endDate,
  }: GetAllQuery): Promise<[Cashflow[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const queryBuilder = this.cashflowRepository
      .createQueryBuilder('cashflow')
      .skip(skip)
      .take(pageSize)
      .orderBy('created_at', 'DESC');

    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }
    const [cashflows, count] = await queryBuilder.getManyAndCount();

    return [cashflows, count];
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
  async findLatestCashFlow(): Promise<Cashflow> {
    const cashflow = await this.cashflowRepository.find({
      order: { created_at: 'DESC' },
      take: 1,
    });
    return cashflow[0];
  }

  async createCashflow(
    userId: number,
    createCashflowDto: CreateCashflowDto,
  ): Promise<Cashflow> {
    if (userId) {
      createCashflowDto.created_byId = userId;
    }
    if (createCashflowDto.amount < 1) {
      throw new BadRequestException("Amount can't be less than 0");
    }
    if (createCashflowDto.created_byId) {
      await this.userService.findUserById(createCashflowDto.created_byId);
    }
    const latestCashflow = await this.findLatestCashFlow();
    const latestTotalAmount = latestCashflow?.total_amount || 0;

    createCashflowDto.total_amount = this.calculateTotalAmount(
      latestTotalAmount,
      createCashflowDto.amount,
      createCashflowDto.type,
    );

    const newCashflow = this.cashflowRepository.create(createCashflowDto);
    return await this.cashflowRepository.save(newCashflow);
  }
  async createCashflowFromArPaymentWithEM(
    entityManager: EntityManager,
    createCashflowDto: CreateCashflowDto,
  ): Promise<Cashflow> {
    if (createCashflowDto.amount < 1) {
      throw new BadRequestException("Amount can't be less than 0");
    }
    const latestCashflow = await this.findLatestCashFlow();
    const latestTotalAmount = latestCashflow?.total_amount || 0;

    createCashflowDto.total_amount = this.calculateTotalAmount(
      latestTotalAmount,
      createCashflowDto.amount,
      createCashflowDto.type,
    );

    const newCashflow = entityManager.create(Cashflow, createCashflowDto);
    return await entityManager.save(newCashflow);
  }

  private calculateTotalAmount(
    latestTotalAmount: number,
    amount: number,
    type: CashflowType,
  ): number {
    return type === CashflowType.IN
      ? latestTotalAmount + amount
      : latestTotalAmount - amount;
  }
}
