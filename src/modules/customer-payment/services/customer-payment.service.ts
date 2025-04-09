import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerPayment } from '../models/customer-payment.entity';
import { CreateCustomerPaymentDto } from '../dtos/create-customer-payment.dto';
import { UpdateCustomerPaymentDto } from '../dtos/update-customer-payment.dto';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { PaymentMethodService } from '@app/modules/payment-method/services/payment-method.service';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class CustomerPaymentService {
  constructor(
    @InjectRepository(CustomerPayment)
    private readonly customerPaymentRepository: Repository<CustomerPayment>,
    private readonly customerService: CustomerService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  async getAllCustomerPayments(): Promise<CustomerPayment[]> {
    return await this.customerPaymentRepository.find();
  }

  async getAllCustomerPaymentsPagination({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[CustomerPayment[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const merchantPayments = await this.customerPaymentRepository.findAndCount({
      skip,
      take: pageSize,
      relations: ['customer', 'payment_method'],
    });
    return merchantPayments;
  }

  async getCustomerrPaymentById(
    customerPaymentId: number,
  ): Promise<CustomerPayment> {
    return await this.customerPaymentRepository.findOne({
      where: { id: customerPaymentId },
    });
  }

  async findCustomerPaymentById(
    customerPaymentId: number,
  ): Promise<CustomerPayment> {
    const customerPayment = await this.customerPaymentRepository.findOne({
      where: { id: customerPaymentId },
      relations: ['customer', 'payment_method'],
    });

    if (!customerPayment) {
      throw new NotFoundException(
        `Customer Payment with id ${customerPaymentId} not found`,
      );
    }
    return customerPayment;
  }

  async findCustomerPaymentByCustIdNPaymentId(
    customerId: number,
    paymentMethodId: number,
  ): Promise<CustomerPayment> {
    const customerPayment = await this.customerPaymentRepository.findOne({
      where: { customerId: customerId, payment_methodId: paymentMethodId },
      relations: ['customer', 'payment_method'],
    });

    if (!customerPayment) {
      throw new NotFoundException(
        `Customer Payment with customerId ${customerId} And paymentMethodId ${paymentMethodId} not found`,
      );
    }
    return customerPayment;
  }

  async createCustomerPayment(
    createCustomerPaymentDto: CreateCustomerPaymentDto,
  ): Promise<CustomerPayment> {
    await this.customerService.findCustomerById(
      createCustomerPaymentDto.customerId,
    );
    await this.paymentMethodService.findPaymentMethodById(
      createCustomerPaymentDto.payment_methodId,
    );
    const newCustomerPayment = this.customerPaymentRepository.create(
      createCustomerPaymentDto,
    );
    return await this.customerPaymentRepository.save(newCustomerPayment);
  }

  async updateCustomerPayment(
    customerPaymentId: number,
    updateCustomerPaymentDto: UpdateCustomerPaymentDto,
  ): Promise<CustomerPayment> {
    const customerPayment =
      await this.findCustomerPaymentById(customerPaymentId);

    Object.assign(customerPayment, updateCustomerPaymentDto);

    return this.customerPaymentRepository.save(customerPayment);
  }

  async deleteCustomerPayment(customerPaymentId: number): Promise<void> {
    await this.findCustomerPaymentById(customerPaymentId);

    await this.customerPaymentRepository.delete(customerPaymentId);
  }
}
