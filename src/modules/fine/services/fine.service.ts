import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fine } from '../models/fine.entity';
import { CreateFineDto } from '../dtos/create-fine.dto';
import { UpdateFineDto } from '../dtos/update-fine.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class FineService {
  constructor(
    @InjectRepository(Fine)
    private readonly fineRepository: Repository<Fine>,
  ) { }

  async getAllFines({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Fine[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const fines = await this.fineRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return fines;
  }

  async getFineById(fineId: number): Promise<Fine> {
    return await this.fineRepository.findOne({ where: { id: fineId } });
  }

  async findFineById(fineId: number): Promise<Fine> {
    const fine = await this.fineRepository.findOne({
      where: { id: fineId },
    });

    if (!fine) {
      throw new NotFoundException(`fine with id ${fineId} not found`);
    }
    return fine;
  }

  async createFine(createFineDto: CreateFineDto): Promise<Fine> {
    const newFine = this.fineRepository.create(createFineDto);
    return await this.fineRepository.save(newFine);
  }

  async updateFine(
    fineId: number,
    updateFineDto: UpdateFineDto,
  ): Promise<Fine> {
    const fine = await this.findFineById(fineId);

    Object.assign(fine, updateFineDto);

    return this.fineRepository.save(fine);
  }

  async deleteFine(fineId: number): Promise<void> {
    await this.findFineById(fineId);

    await this.fineRepository.delete(fineId);
  }
}
