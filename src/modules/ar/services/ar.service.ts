import { Injectable, NotFoundException } from '@nestjs/common';
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

interface GetAllQuery {
  pageNo?: number;
  pageSize?: number;
  sort?: ArSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  compact?: boolean;
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
  }: GetAllQuery): Promise<[GetAllArResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;
    let sortBy: string = `ar.${sort}`;
    if (sort === ArSort.CUSTOMER) {
      sortBy = `${sort}.name`;
    }
    if (sort === ArSort.INVOICE) {
      sortBy = `${sort}.invoice_no`;
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

    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

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
}
