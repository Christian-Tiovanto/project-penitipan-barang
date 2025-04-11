import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, MoreThanOrEqual, LessThan } from 'typeorm';
import { Invoice } from '../models/invoice.entity';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { InvoiceStatus } from '@app/enums/invoice-status';
import {
  InvoiceSort,
  SortOrder,
  SortOrderQueryBuilder,
} from '@app/enums/sort-order';
import { GetAllInvoiceResponse } from '../classes/invoice.response';

interface GetAllQuery {
  pageNo?: number;
  pageSize?: number;
  sort?: InvoiceSort;
  order?: SortOrder;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  customer?: string;
  compact?: boolean;
  status?: InvoiceStatus;
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async getAllInvoices(): Promise<Invoice[]> {
    return await this.invoiceRepository.find(); // Assuming using TypeORM
  }

  async getAllInvoicesPagination({
    pageNo,
    pageSize,
    sort,
    order,
    startDate,
    endDate,
    customer,
    status,
  }: GetAllQuery): Promise<[GetAllInvoiceResponse[], number]> {
    const skip = (pageNo - 1) * pageSize;
    let sortBy: string = `invoice.${sort}`;
    if (sort === InvoiceSort.CUSTOMER) {
      sortBy = `${sort}.name`;
    }

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .skip(skip)
      .take(pageSize)
      .leftJoinAndSelect('invoice.customer', 'customer')
      .select(['invoice', 'customer.name', 'customer.id'])
      .orderBy(sortBy, order.toUpperCase() as SortOrderQueryBuilder);

    if (customer) {
      queryBuilder.andWhere({ customerId: customer });
    }

    if (status) {
      queryBuilder.andWhere({ status });
    }
    if (startDate) {
      queryBuilder.andWhere({ created_at: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere({ created_at: LessThan(endDate) });
    }
    console.log(queryBuilder.getQuery());
    const ars = (await queryBuilder.getManyAndCount()) as unknown as [
      GetAllInvoiceResponse[],
      number,
    ];
    return ars;
  }

  async getInvoiceById(invoiceId: number): Promise<Invoice> {
    return await this.invoiceRepository.findOne({ where: { id: invoiceId } });
  }

  async findInvoiceById(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${invoiceId} not found`);
    }
    return invoice;
  }

  async getMaxIdInvoice(): Promise<number> {
    const maxInvoice = await this.invoiceRepository.find({
      order: { id: 'DESC' },
      select: ['id'],
      take: 1,
    });
    const maxId = maxInvoice.length > 0 ? maxInvoice[0].id : 0;
    return maxId;
  }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    entityManager?: EntityManager,
  ): Promise<Invoice> {
    const repo = entityManager
      ? entityManager.getRepository(Invoice)
      : this.invoiceRepository;
    const newInvoice = repo.create(createInvoiceDto);
    return repo.save(newInvoice);
  }

  //     async updateInvoice(
  //         invoiceId: number,
  //         updateInvoiceDto: UpdateInvoiceDto,
  //     ): Promise<Invoice> {
  //         const invoice = await this.findInvoiceById(invoiceId);

  //         Object.assign(invoice, updateInvoiceDto);

  //         return this.invoiceRepository.save(invoice);
  //     }
}
