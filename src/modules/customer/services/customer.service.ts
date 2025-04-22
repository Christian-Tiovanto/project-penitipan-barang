import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Customer } from '../models/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomerSort } from '../classes/customer.query';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { GetCustomerResponse } from '../classes/customer.response';

interface GetAllCustomerQuery {
  pageNo: number;
  pageSize: number;
  sort?: CustomerSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
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

  // async getAllCustomersPagination({
  //   pageNo,
  //   pageSize,
  // }: GetAllQuery): Promise<[Customer[], number]> {
  //   const skip = (pageNo - 1) * pageSize;
  //   const customers = await this.customerRepository.findAndCount({
  //     skip,
  //     take: pageSize,
  //     where: { is_deleted: false },
  //   });
  //   return customers;
  // }

  async getAllCustomersPagination({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllCustomerQuery): Promise<[GetCustomerResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;

    let sortBy: string = `customer.${sort}`;
    // if (
    //   sort === UserSort.EMAIL ||
    //   sort === UserSort.FULLNAME ||
    //   sort === UserSort.PIN ||
    //   sort === UserSort.ROLE
    // ) {
    //   sortBy = `${sort}.name`;
    // }
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      // .leftJoinAndSelect('user.customer', 'customer')
      // .leftJoinAndSelect('user.product', 'product')
      .skip(skip)
      .take(pageSize)
      .select(['customer'])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

    //Conditionally add filters
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('name LIKE :search', { search: `%${search}%` })
            .orWhere('code LIKE :search', { search: `%${search}%` })
            .orWhere('address LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [customers, count] = await queryBuilder.getManyAndCount();
    const customerResponse: GetCustomerResponse[] = customers.map(
      (customer: GetCustomerResponse) => {
        return {
          id: customer.id,
          name: customer.name,
          code: customer.code,
          address: customer.address,
        };
      },
    );
    return [customerResponse, count];
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
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['transaction_in'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    if (customer.transaction_in.length != 0) {
      throw new ConflictException(
        "Can't delete a Customer that already create Transaction In",
      );
    }

    await this.customerRepository.update(customerId, { is_deleted: true });
  }
}
