import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CustomerPayment } from '../models/customer-payment.entity';
import { CreateCustomerPaymentDto } from '../dtos/create-customer-payment.dto';
import { UpdateCustomerPaymentDto } from '../dtos/update-customer-payment.dto';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { PaymentMethodService } from '@app/modules/payment-method/services/payment-method.service';
import { CustomerPaymentSort } from '../classes/customer-payment.query';
import { GetCustomerPaymentResponse } from '../classes/customer-payment.response';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';

interface GetAllCustomerPaymentQuery {
  pageNo: number;
  pageSize: number;
  sort?: CustomerPaymentSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
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

  // async getAllCustomerPaymentsPagination({
  //   pageNo,
  //   pageSize,
  // }: GetAllQuery): Promise<[CustomerPayment[], number]> {
  //   const skip = (pageNo - 1) * pageSize;
  //   const merchantPayments = await this.customerPaymentRepository.findAndCount({
  //     skip,
  //     take: pageSize,
  //     relations: ['customer', 'payment_method'],
  //   });
  //   return merchantPayments;
  // }

  async getAllCustomerPaymentsPagination({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllCustomerPaymentQuery): Promise<
    [GetCustomerPaymentResponse[], number]
  > {
    const skip = (pageNo - 1) * pageSize;

    let sortBy: string = `customer_payments.${sort}`;
    if (
      sort === CustomerPaymentSort.CUSTOMER ||
      sort === CustomerPaymentSort.PAYMENT_METHOD
    ) {
      sortBy = `${sort}.name`;
    }
    const queryBuilder = this.customerPaymentRepository
      .createQueryBuilder('customer_payments')
      .leftJoinAndSelect('customer_payments.customer', 'customer')
      .leftJoinAndSelect('customer_payments.payment_method', 'payment_method')
      .skip(skip)
      .take(pageSize)
      .select([
        'customer_payments',
        'customer.name',
        'customer.id',
        'payment_method.name',
        'payment_method.id',
      ])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

    // Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('customer.name LIKE :search', { search: `%${search}%` })
            .orWhere('payment_method.name LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('charge LIKE :search', { search: `%${search}%` })
            .orWhere('status LIKE :search', { search: `%${search}%` })
            .orWhere('min_pay LIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const [customerPayments, count] = await queryBuilder.getManyAndCount();
    const customerPaymentResponse: GetCustomerPaymentResponse[] =
      customerPayments.map((customerPayment: GetCustomerPaymentResponse) => {
        return {
          id: customerPayment.id,
          customer: {
            id: customerPayment.customer.id,
            name: customerPayment.customer.name,
          },
          payment_method: {
            id: customerPayment.payment_method.id,
            name: customerPayment.payment_method.name,
          },
          charge: customerPayment.charge,
          status: customerPayment.status,
          min_pay: customerPayment.min_pay,
        };
      });
    return [customerPaymentResponse, count];
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
