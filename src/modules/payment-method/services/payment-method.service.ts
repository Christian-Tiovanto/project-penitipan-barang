import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { PaymentMethod } from '../models/payment-method.entity';
import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import { GetPaymentMethodResponse } from '../classes/payment-method.response';
import { SortOrder, SortOrderQueryBuilder } from '@app/enums/sort-order';
import { PaymentMethodSort } from '../classes/payment-method.query';

interface GetAllPaymentMethodQuery {
  pageNo: number;
  pageSize: number;
  sort?: PaymentMethodSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.find();
  }

  // async getAllPaymentMethodsPagination({
  //   pageNo,
  //   pageSize,
  // }: GetAllQuery): Promise<[PaymentMethod[], number]> {
  //   const skip = (pageNo - 1) * pageSize;
  //   const paymentMethods = await this.paymentMethodRepository.findAndCount({
  //     skip,
  //     take: pageSize,
  //   });
  //   return paymentMethods;
  // }

  async getAllPaymentMethodsPagination({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    search,
  }: GetAllPaymentMethodQuery): Promise<[GetPaymentMethodResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;

    let sortBy: string = `payment_methods.${sort}`;
    // if (
    //   sort === UserSort.EMAIL ||
    //   sort === UserSort.FULLNAME ||
    //   sort === UserSort.PIN ||
    //   sort === UserSort.ROLE
    // ) {
    //   sortBy = `${sort}.name`;
    // }
    const queryBuilder = this.paymentMethodRepository
      .createQueryBuilder('payment_methods')
      // .leftJoinAndSelect('user.customer', 'customer')
      // .leftJoinAndSelect('user.product', 'product')
      .skip(skip)
      .take(pageSize)
      .select(['payment_methods'])
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
          qb.where('name LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [paymentMethods, count] = await queryBuilder.getManyAndCount();
    const paymentMethodResponse: GetPaymentMethodResponse[] =
      paymentMethods.map((paymentMethod: GetPaymentMethodResponse) => {
        return {
          id: paymentMethod.id,
          name: paymentMethod.name,
        };
      });
    return [paymentMethodResponse, count];
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
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId },
      relations: ['customer_payment'],
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment Method with id ${paymentMethodId} not found`,
      );
    }

    if (paymentMethod.customer_payment.length != 0) {
      throw new ConflictException(
        "Can't delete a Payment Method that already been used for Customer Payment, delete the Customer Payment First",
      );
    }
    await this.paymentMethodRepository.delete(paymentMethodId);
  }
}
