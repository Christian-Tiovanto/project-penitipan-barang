import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../models/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find({ where: { is_deleted: false } });
  }

  async getAllCustomersPagination({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[Customer[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const customers = await this.customerRepository.findAndCount({
      skip,
      take: pageSize,
      where: { is_deleted: false },
    });
    return customers;
  }

  async getCustomerById(customerId: number): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { id: customerId, is_deleted: false },
    });
  }

  async findCustomerById(customerId: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, is_deleted: false },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    return customer;
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    const newCustomer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(newCustomer);
  }

  async updateCustomer(
    customerId: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findCustomerById(customerId);

    Object.assign(customer, updateCustomerDto);

    return this.customerRepository.save(customer);
  }

  async deleteCustomer(customerId: number): Promise<void> {
    await this.findCustomerById(customerId);

    await this.customerRepository.update(customerId, { is_deleted: true });
  }
}
