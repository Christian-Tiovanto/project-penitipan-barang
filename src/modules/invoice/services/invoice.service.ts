import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Invoice } from '../models/invoice.entity';
// import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';

interface GetAllQuery {
    pageNo: number;
    pageSize: number;
}

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
    ) { }

    async getAllInvoices({
        pageNo,
        pageSize,
    }: GetAllQuery): Promise<[Invoice[], number]> {
        const skip = (pageNo - 1) * pageSize;
        const invoices = await this.invoiceRepository.findAndCount({
            skip,
            take: pageSize,
        });
        return invoices;
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
            order: { id: "DESC" },
            select: ["id"],
            take: 1,
        });
        const maxId = maxInvoice.length > 0 ? maxInvoice[0].id : 0;
        return maxId;
    }



    async createInvoice(createInvoiceDto: CreateInvoiceDto, entityManager?: EntityManager): Promise<Invoice> {
        const repo = entityManager ? entityManager.getRepository(Invoice) : this.invoiceRepository;
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
