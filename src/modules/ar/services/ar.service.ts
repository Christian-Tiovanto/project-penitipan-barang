import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Ar } from '../models/ar.entity';
// import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { CreateArDto } from '../dtos/create-ar.dto';

interface GetAllQuery {
    pageNo: number;
    pageSize: number;
}

@Injectable()
export class ArService {
    constructor(
        @InjectRepository(Ar)
        private readonly arRepository: Repository<Ar>,
    ) { }

    async getAllArs({
        pageNo,
        pageSize,
    }: GetAllQuery): Promise<[Ar[], number]> {
        const skip = (pageNo - 1) * pageSize;
        const ars = await this.arRepository.findAndCount({
            skip,
            take: pageSize,
        });
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
            order: { id: "DESC" },
            select: ["id"],
            take: 1,
        });
        const maxId = maxAr.length > 0 ? maxAr[0].id : 0;
        return maxId;
    }

    async createAr(createArDto: CreateArDto, entityManager?: EntityManager): Promise<Ar> {
        const repo = entityManager ? entityManager.getRepository(Ar) : this.arRepository;
        const newAr = repo.create(createArDto);
        return repo.save(newAr);
    }

    //     async updateAr(
    //         arId: number,
    //         updateArDto: UpdateArDto,
    //     ): Promise<Ar> {
    //         const ar = await this.findArById(arId);

    //         Object.assign(ar, updateArDto);

    //         return this.arRepository.save(ar);
    //     }
}
