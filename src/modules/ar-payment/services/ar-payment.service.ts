import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArPayment } from '../models/ar-payment.entity';
import { CreateArPaymentDto } from '../dtos/create-ar-payment.dto';
import { CustomerPaymentService } from '@app/modules/customer-payment/services/customer-payment.service';
import { CashflowService } from '@app/modules/cashflow/services/cashflow.service';
interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class ArPaymentService {
  constructor(
    @InjectRepository(ArPayment)
    private readonly arPaymentRepository: Repository<ArPayment>,
    private readonly customerPaymentService: CustomerPaymentService,
    private readonly cashflowService: CashflowService,
  ) {}

  async getAllArPayments({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[ArPayment[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const arPayments = await this.arPaymentRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return arPayments;
  }

  async findArPaymentById(arPaymentId: number): Promise<ArPayment> {
    const arPayment = await this.arPaymentRepository.findOne({
      where: { id: arPaymentId },
    });

    if (!arPayment) {
      throw new NotFoundException(
        `Acc Receivable Payment with id ${arPaymentId} not found`,
      );
    }
    return arPayment;
  }

  async createArPayment(
    createArPaymentId: CreateArPaymentDto,
  ): Promise<ArPayment> {
    await this.customerPaymentService.findCustomerPaymentById(
      createArPaymentId.customer_paymentId,
    );
    const newProductUnit = this.arPaymentRepository.create(createArPaymentId);
    return await this.arPaymentRepository.save(newProductUnit);
  }
}
