import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../models/merchant.entity';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { UpdateMerchantDto } from '../dtos/update-merchant.dto';

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

  async getAllMerchant(): Promise<Merchant[]> {
    const merchants = await this.merchantRepository.find();
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
