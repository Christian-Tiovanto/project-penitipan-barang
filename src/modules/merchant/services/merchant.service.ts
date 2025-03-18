import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../models/merchant.entity';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { UpdateMerchantDto } from '../dtos/update-merchant.dto';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async createMerchant(
    createMerchantDto: CreateMerchantDto,
  ): Promise<Merchant> {
    const merchant = this.merchantRepository.create(createMerchantDto);
    const createdMerchant = await this.merchantRepository.save(merchant);
    return createdMerchant;
  }

  async getAllMerchant({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Merchant[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const merchants = await this.merchantRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return merchants;
  }

  async findMerchantById(id: number): Promise<Merchant> {
    const user = await this.merchantRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('No Merchant with that id');
    return user;
  }

  async updateMerchantById(
    merchantId: number,
    updateMerchantDto: UpdateMerchantDto,
  ): Promise<Merchant> {
    const merchant = await this.findMerchantById(merchantId);
    Object.assign(merchant, updateMerchantDto);
    await this.merchantRepository.save(merchant);
    return merchant;
  }
}
