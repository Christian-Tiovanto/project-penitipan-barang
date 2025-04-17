import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ArPayment } from '../models/ar-payment.entity';
import { CreateArPaymentDto } from '../dtos/create-ar-payment.dto';
import { CustomerPaymentService } from '@app/modules/customer-payment/services/customer-payment.service';
import { CashflowService } from '@app/modules/cashflow/services/cashflow.service';
import { CreateCashflowDto } from '@app/modules/cashflow/dtos/create-cashflow.dto';
import { CashflowType } from '@app/enums/cashflow-type';
import { ArService } from '@app/modules/ar/services/ar.service';
import { CreateBulkArPaymentDto } from '../dtos/create-bulk-ar-payment.dto';
import { Ar } from '@app/modules/ar/models/ar.entity';
import { ArStatus } from '@app/enums/ar-status';
import { InvoiceService } from '@app/modules/invoice/services/invoice.service';
import { InvoiceStatus } from '@app/enums/invoice-status';
import { CashflowFrom } from '@app/modules/cashflow/models/cashflow.entity';
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
    private readonly arService: ArService,
    private readonly invoiceService: InvoiceService,
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
    createArPaymentDto: CreateArPaymentDto,
  ): Promise<ArPayment> {
    const customerPayment =
      await this.customerPaymentService.findCustomerPaymentById(
        createArPaymentDto.customer_paymentId,
      );
    const ar = await this.arService.findArById(createArPaymentDto.arId);
    ar.to_paid -= createArPaymentDto.total_paid;
    ar.total_paid += createArPaymentDto.total_paid;
    createArPaymentDto.payment_method_name =
      customerPayment.payment_method.name;
    if (ar.to_paid < 0) {
      throw new BadRequestException(
        `AR ${ar.ar_no} To paid only ${Number(ar.to_paid + createArPaymentDto.total_paid).toLocaleString('id-Id')}`,
      );
    }

    const arPayment = await this.arPaymentRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const newArPayment = entityManager.create(
          ArPayment,
          createArPaymentDto,
        );

        if (ar.to_paid === 0) {
          ar.status = ArStatus.COMPLETED;
          await this.invoiceService.updateInvoiceStatusById(
            ar.invoiceId,
            InvoiceStatus.COMPLETED,
            entityManager,
          );
        }
        await this.arService.updateArWithEM(ar, entityManager);

        const createCashflowDto: CreateCashflowDto = {
          type: CashflowType.IN,
          amount: createArPaymentDto.total_paid,
          from: CashflowFrom.PAYMENT,
        };
        await this.cashflowService.createCashflowFromArPaymentWithEM(
          entityManager,
          createCashflowDto,
        );
        return entityManager.save(newArPayment);
      },
    );
    return arPayment;
  }
  async createBulkArPayment(
    createBulkArPaymentDto: CreateBulkArPaymentDto,
  ): Promise<ArPayment[]> {
    const { payment_methodId, transfer_date, reference_no } =
      createBulkArPaymentDto;
    const toCreateArPayment: CreateArPaymentDto[] = [];
    const toCreateCashflow: CreateCashflowDto[] = [];
    const toUpdateAr: Ar[] = [];
    const toUpdateInvoice: number[] = [];
    for (const data of createBulkArPaymentDto.data) {
      const ar = await this.arService.findArById(data.arId);
      const customerPayment =
        await this.customerPaymentService.findCustomerPaymentByCustIdNPaymentId(
          ar.customerId,
          payment_methodId,
        );
      if (!customerPayment.status)
        throw new ForbiddenException('Customer Payment Method is not active');

      ar.to_paid -= data.total_paid;
      ar.total_paid += data.total_paid;
      if (ar.to_paid < 0) {
        throw new BadRequestException(
          `AR ${ar.ar_no} To paid only ${Number(ar.to_paid + data.total_paid).toLocaleString('id-Id')}`,
        );
      }
      if (ar.to_paid === 0) {
        ar.status = ArStatus.COMPLETED;
        toUpdateInvoice.push(ar.invoiceId);
      }
      const createArPaymentDto: CreateArPaymentDto = {
        arId: data.arId,
        total_paid: data.total_paid,
        customer_paymentId: customerPayment.id,
        transfer_date,
        reference_no,
        customerId: ar.customerId,
        payment_method_name: customerPayment.payment_method.name,
      };
      const createCashflowDto: CreateCashflowDto = {
        type: CashflowType.IN,
        amount: data.total_paid,
        from: CashflowFrom.PAYMENT,
      };
      toCreateCashflow.push(createCashflowDto);
      toCreateArPayment.push(createArPaymentDto);
      toUpdateAr.push(ar);
    }
    const arPayment = await this.arPaymentRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const newArPayment = entityManager.create(ArPayment, toCreateArPayment);
        await this.cashflowService.createBulkCashflowFromArPaymentWithEM(
          entityManager,
          toCreateCashflow,
        );
        await this.arService.updateBulkArWithEM(entityManager, toUpdateAr);
        if (toUpdateInvoice.length > 0) {
          await this.invoiceService.updateBulkInvoiceStatusById(
            toUpdateInvoice,
            InvoiceStatus.COMPLETED,
            entityManager,
          );
        }
        return entityManager.save(newArPayment);
      },
    );
    return arPayment;
  }
}
