import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../models/payment-method.entity';
import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) { }

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.find();
  }

  async getAllPaymentMethodsPagination({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[PaymentMethod[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const paymentMethods = await this.paymentMethodRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return paymentMethods;
  }

  async getPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod> {
    return await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId },
    });
  }

  async findPaymentMethodById(paymentMethodId: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment Method with id ${paymentMethodId} not found`,
      );
    }
    return paymentMethod;
  }

  async createPaymentMethod(
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const newPaymentMethod = this.paymentMethodRepository.create(
      createPaymentMethodDto,
    );
    return await this.paymentMethodRepository.save(newPaymentMethod);
  }

  async updatePaymentMethod(
    paymentMethodId: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.findPaymentMethodById(paymentMethodId);

    Object.assign(paymentMethod, updatePaymentMethodDto);

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async deletePaymentMethod(paymentMethodId: number): Promise<void> {
    await this.findPaymentMethodById(paymentMethodId);

    await this.paymentMethodRepository.delete(paymentMethodId);
  }
}
