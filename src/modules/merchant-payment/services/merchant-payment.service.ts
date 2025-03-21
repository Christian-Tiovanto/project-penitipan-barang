import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPayment } from '../models/merchant-payment.entity';
import { CreateMerchantPaymentDto } from '../dtos/create-merchant-payment.dto';
import { UpdateMerchantPaymentDto } from '../dtos/update-merchant-payment.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class MerchantPaymentService {
  constructor(
    @InjectRepository(MerchantPayment)
    private readonly merchantPaymentRepository: Repository<MerchantPayment>,
  ) { }

  async getAllMerchantPayments({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[MerchantPayment[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const merchantPayments = await this.merchantPaymentRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return merchantPayments;
  }

  async getMerchantPaymentById(merchantPaymentId: number): Promise<MerchantPayment> {
    return await this.merchantPaymentRepository.findOne({ where: { id: merchantPaymentId } });
  }

  async findMerchantPaymentById(merchantPaymentId: number): Promise<MerchantPayment> {
    const merchantPayment = await this.merchantPaymentRepository.findOne({
      where: { id: merchantPaymentId },
    });

    if (!merchantPayment) {
      throw new NotFoundException(`Merchant Payment with id ${merchantPaymentId} not found`);
    }
    return merchantPayment;
  }

  async createMerchantPayment(createMerchantPaymentDto: CreateMerchantPaymentDto): Promise<MerchantPayment> {
    const newMerchantPayment = this.merchantPaymentRepository.create(createMerchantPaymentDto);
    return await this.merchantPaymentRepository.save(newMerchantPayment);
  }

  async updateMerchantPayment(
    merchantPaymentId: number,
    updateMerchantPaymentDto: UpdateMerchantPaymentDto,
  ): Promise<MerchantPayment> {
    const merchantPayment = await this.findMerchantPaymentById(merchantPaymentId);

    Object.assign(merchantPayment, updateMerchantPaymentDto);

    return this.merchantPaymentRepository.save(merchantPayment);
  }

  async deleteMerchantPayment(merchantPaymentId: number): Promise<void> {
    await this.findMerchantPaymentById(merchantPaymentId);

    await this.merchantPaymentRepository.delete(merchantPaymentId);
  }
}
