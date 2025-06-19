import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ArPayment } from '../models/ar-payment.entity';
import { CreateArPaymentDto } from '../dtos/create-ar-payment.dto';
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
import { PaymentMethodService } from '@app/modules/payment-method/services/payment-method.service';
interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}
@Injectable()
export class ArPaymentService {
  constructor(
    @InjectRepository(ArPayment)
    private readonly arPaymentRepository: Repository<ArPayment>,
    private readonly paymentMethodService: PaymentMethodService,
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
      const paymentMethod =
        await this.paymentMethodService.findPaymentMethodById(payment_methodId);
      ar.to_paid -= data.total_paid;
      ar.total_paid += data.total_paid;
      ar.status = ArStatus.PARTIAL;
      if (ar.to_paid < 0) {
        throw new BadRequestException(
          `AR ${ar.ar_no} To paid only ${Number(ar.to_paid + data.total_paid).toLocaleString('id-Id')}`,
        );
      }
      if (ar.to_paid === 0) {
        ar.status = ArStatus.COMPLETED;
        ar.paid_date = createBulkArPaymentDto.transfer_date;
        toUpdateInvoice.push(ar.invoiceId);
      }
      const createArPaymentDto: CreateArPaymentDto = {
        arId: data.arId,
        total_paid: data.total_paid,
        customer_paymentId: paymentMethod.id,
        transfer_date,
        reference_no,
        customerId: ar.customerId,
        payment_method_name: paymentMethod.name,
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
