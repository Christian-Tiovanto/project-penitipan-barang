import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, MoreThanOrEqual, LessThan } from 'typeorm';
import { Ar } from '../models/ar.entity';
import { CreateArDto } from '../dtos/create-ar.dto';
import {
  ArSort,
  SortOrder,
  SortOrderQueryBuilder,
} from '@app/enums/sort-order';
import { GetAllArResponse } from '../classes/ar.response';
import { ArStatus } from '@app/enums/ar-status';

interface GetAllQuery {
  pageNo?: number;
  pageSize?: number;
  sort?: ArSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  customer?: string;
  compact?: boolean;
  status?: ArStatus;
  with_payment?: boolean;
}

@Injectable()
export class ArService {
  constructor(
    @InjectRepository(Ar)
    private readonly arRepository: Repository<Ar>,
  ) {}

  async getAllArs({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    compact,
    customer,
    with_payment,
    status,
  }: GetAllQuery): Promise<[GetAllArResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;
    let sortBy: string = `ar.${sort}`;
    if (sort === ArSort.CUSTOMER) {
      sortBy = `${sort}.name`;
    }

    if (sort === ArSort.AR_PAYMENT && !with_payment) {
      throw new BadRequestException(
        'sort by Payment can only be used along with `with_payment`',
      );
    }
    if (sort === ArSort.AR_PAYMENT) {
      sortBy = `${sort}.payment_method_name`;
    }

    const queryBuilder = this.arRepository
      .createQueryBuilder('ar')
      .skip(skip)
      .take(pageSize)
      .leftJoinAndSelect('ar.customer', 'customer')
      .select(['ar', 'customer.name', 'customer.id'])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);
    if (!compact) {
      queryBuilder.leftJoinAndSelect('ar.invoice', 'invoice');
    }

    if (with_payment) {
      queryBuilder.leftJoinAndSelect('ar.ar_payment', 'ar_payment');
    }
    if (customer) {
      queryBuilder.andWhere({ customerId: customer });
    }

    if (status) {
      queryBuilder.andWhere({ status });

    }
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }
    console.log(queryBuilder.getQuery());
    const ars = (await queryBuilder.getManyAndCount()) as unknown as [
      GetAllArResponse[],
      number,
    ];
    return ars;
  }

  async getArById(arId: number): Promise<Ar> {
    return await this.arRepository.findOne({ where: { id: arId } });
  }

  async findArById(arId: number): Promise<Ar> {
    const ar = await this.arRepository.findOne({
      where: { id: arId },
    });

    if (!ar) {
      throw new NotFoundException(`Ar with id ${arId} not found`);
    }
    return ar;
  }

  async getMaxIdAr(): Promise<number> {
    const maxAr = await this.arRepository.find({
      order: { id: 'DESC' },
      select: ['id'],
      take: 1,
    });
    const maxId = maxAr.length > 0 ? maxAr[0].id : 0;
    return maxId;
  }

  async createAr(
    createArDto: CreateArDto,
    entityManager?: EntityManager,
  ): Promise<Ar> {
    const repo = entityManager
      ? entityManager.getRepository(Ar)
      : this.arRepository;
    const newAr = repo.create(createArDto);
    return repo.save(newAr);
  }

  async updateArWithEM(ar: Ar, entityManager: EntityManager) {
    await entityManager.save(Ar, ar);
  }
  
  async updateBulkArWithEM(entityManager: EntityManager, ar: Ar[]) {
    await entityManager.save(Ar, ar);
  }

}
