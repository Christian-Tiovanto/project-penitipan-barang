import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Charge } from '../models/charge.entity';
import { CreateChargeDto } from '../dtos/create-charge.dto';
import { UpdateChargeDto } from '../dtos/update-charge.dto';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class ChargeService {
  constructor(
    @InjectRepository(Charge)
    private readonly chargeRepository: Repository<Charge>,
  ) {}

  async getAllCharge({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Charge[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const charges = await this.chargeRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return charges;
  }

  async getChargeById(chargeId: number): Promise<Charge> {
    return await this.chargeRepository.findOne({
      where: { id: chargeId },
    });
  }

  async findChargeById(chargeId: number): Promise<Charge> {
    const charge = await this.chargeRepository.findOne({
      where: { id: chargeId },
    });

    if (!charge) {
      throw new NotFoundException(`Charge with id ${chargeId} not found`);
    }
    return charge;
  }

  async createCharge(createChargeDto: CreateChargeDto): Promise<Charge> {
    const newCharge = this.chargeRepository.create(createChargeDto);
    return await this.chargeRepository.save(newCharge);
  }

  async updateCharge(
    chargeId: number,
    updateChargeDto: UpdateChargeDto,
  ): Promise<Charge> {
    const paymentMethod = await this.findChargeById(chargeId);

    Object.assign(paymentMethod, updateChargeDto);

    return this.chargeRepository.save(paymentMethod);
  }

  async deleteCharge(chargeId: number): Promise<void> {
    await this.findChargeById(chargeId);

    await this.chargeRepository.delete(chargeId);
  }
}
