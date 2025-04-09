import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Spb } from '../models/spb.entity';
// import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { CreateSpbDto } from '../dtos/create-spb.dto';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class SpbService {
  constructor(
    @InjectRepository(Spb)
    private readonly spbRepository: Repository<Spb>,
  ) {}

  async getAllSpbs({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Spb[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const spbs = await this.spbRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return spbs;
  }

  async getSpbById(spbId: number): Promise<Spb> {
    return await this.spbRepository.findOne({ where: { id: spbId } });
  }

  async getSpbByInvoiceId(invoiceId: number): Promise<Spb> {
    const spb = await this.spbRepository.findOne({
      where: { invoiceId },
      relations: ['invoice', 'customer'],
    });

    if (!spb) {
      throw new NotFoundException(`Spb with Invoice id ${invoiceId} not found`);
    }
    return spb;
  }

  async findSpbById(spbId: number): Promise<Spb> {
    const spb = await this.spbRepository.findOne({
      where: { id: spbId },
    });

    if (!spb) {
      throw new NotFoundException(`Spb with id ${spbId} not found`);
    }
    return spb;
  }

  async createSpb(
    createSpbDto: CreateSpbDto,
    entityManager?: EntityManager,
  ): Promise<Spb> {
    const repo = entityManager
      ? entityManager.getRepository(Spb)
      : this.spbRepository;
    const newSpb = repo.create(createSpbDto);
    return repo.save(newSpb);
  }

  //     async updateSpb(
  //         spbId: number,
  //         updateSpbDto: UpdateSpbDto,
  //     ): Promise<Spb> {
  //         const spb = await this.findSpbById(spbId);

  //         Object.assign(spb, updateSpbDto);

  //         return this.spbRepository.save(spb);
  //     }
}
