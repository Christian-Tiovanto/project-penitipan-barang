import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Cashflow, CashflowFrom } from '../models/cashflow.entity';
import { CreateCashflowDto } from '../dtos/create-cashflow.dto';
import { UserService } from '@app/modules/user/services/user.service';
import { CashflowType } from '@app/enums/cashflow-type';

interface GetAllCashflowQuery {
  pageNo?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
  type?: CashflowType;
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
    type,
  }: GetAllCashflowQuery): Promise<[Cashflow[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const queryBuilder = this.cashflowRepository
      .createQueryBuilder('cashflow')
      .orderBy('created_at', 'DESC');

    if (pageNo) {
      queryBuilder.skip(skip).take(pageSize);
    }

    if (type) {
      queryBuilder.andWhere({ type });
    }
    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
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
    createCashflowDto.from = CashflowFrom.INPUT;
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
  async createBulkCashflowFromArPaymentWithEM(
    entityManager: EntityManager,
    createBulkCashflowDto: CreateCashflowDto[],
  ): Promise<Cashflow[]> {
    const latestCashflow = await this.findLatestCashFlow();
    let latestTotalAmount = latestCashflow?.total_amount || 0;
    for (const cashflowDto of createBulkCashflowDto) {
      if (cashflowDto.amount < 1) {
        throw new BadRequestException("Amount can't be less than 0");
      }
      cashflowDto.from = CashflowFrom.PAYMENT;
      cashflowDto.total_amount = this.calculateTotalAmount(
        latestTotalAmount,
        cashflowDto.amount,
        cashflowDto.type,
      );
      latestTotalAmount += cashflowDto.total_amount;
    }
    const newCashflow = entityManager.create(Cashflow, createBulkCashflowDto);
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

  async getTotalCashflow({ startDate, endDate, type }: GetAllCashflowQuery) {
    const queryBuilder = this.cashflowRepository
      .createQueryBuilder('cashflow')
      .select('SUM(cashflow.amount)', 'total')
      .where({ type });

    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }
    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }
    const cashflow: { total: string } = await queryBuilder.getRawOne();
    return cashflow;
  }
  async getInitialBalance({ endDate }: GetAllCashflowQuery) {
    const queryBuilder = this.cashflowRepository
      .createQueryBuilder('cashflow')
      .select(
        `SUM(CASE WHEN cashflow.type = '${CashflowType.IN}' THEN cashflow.amount ELSE -cashflow.amount END)`,
        'total',
      );

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }
    const cashflow: { total: string } = await queryBuilder.getRawOne();
    return parseFloat(cashflow?.total || '0');
  }
  async getTotalSumAmount({ startDate, endDate, type }: GetAllCashflowQuery) {
    const queryBuilder = this.cashflowRepository
      .createQueryBuilder('cashflow')
      .select('SUM(cashflow.amount)', 'total')
      .where({ type });

    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }
    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }
    const cashflow: { total: string } = await queryBuilder.getRawOne();

    return parseFloat(cashflow?.total || '0');
  }
}
