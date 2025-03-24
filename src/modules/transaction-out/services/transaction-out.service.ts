import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { TransactionOut } from '../models/transaction-out.entity';
import { CreateTransactionOutDto, CreateTransactionOutWithSpbDto } from '../dtos/create-transaction-out.dto';
import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ProductService } from '@app/modules/product/services/product.service';
import { ProductUnitService } from '@app/modules/product-unit/services/product-unit.service';
import { CustomerService } from '@app/modules/customer/services/customer.service';
import { TransactionIn } from '@app/modules/transaction-in/models/transaction-in.entity';
import { TransactionInService } from '@app/modules/transaction-in/services/transaction-in.service';
import { isOutsideBusinessHours, isPastDays, pastDaysCount } from '@app/utils/date';
import { Invoice } from '@app/modules/invoice/models/invoice.entity';
import { CreateInvoiceDto } from '@app/modules/invoice/dtos/create-invoice.dto';
import { create } from 'domain';
import { CreateSpbDto } from '@app/modules/spb/dtos/create-spb.dto';
import { CreateArDto } from '@app/modules/accreceivable/dtos/create-ar.dto';
import { InvoiceService } from '@app/modules/invoice/services/invoice.service';
import { ArService } from '@app/modules/accreceivable/services/ar.service';
import { SpbService } from '@app/modules/spb/services/spb.service';
import { ChargeService } from '@app/modules/charge/services/charge.service';


interface GetAllQuery {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class TransactionOutService {
  constructor(
    @InjectRepository(TransactionOut)
    private readonly transactionOutRepository: Repository<TransactionOut>,
    private productService: ProductService,
    private transactionInService: TransactionInService,
    private invoiceService: InvoiceService,
    private arService: ArService,
    private spbService: SpbService,
    private chargeService: ChargeService,
  ) { }

  async getAllTransactionOuts({
    pageNo,
    pageSize,
  }: GetAllQuery): Promise<[TransactionOut[], number]> {
    const skip = (pageNo - 1) * pageSize;
    const transactionOuts = await this.transactionOutRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return transactionOuts;
  }

  async getTransactionOutById(transactionOutId: number): Promise<TransactionOut> {
    return await this.transactionOutRepository.findOne({ where: { id: transactionOutId } });
  }

  async findTransactionOutById(transactionOutId: number): Promise<TransactionOut> {
    const transactionOut = await this.transactionOutRepository.findOne({
      where: { id: transactionOutId },
    });

    if (!transactionOut) {
      throw new NotFoundException(`Transaction Out with id ${transactionOutId} not found`);
    }
    return transactionOut;
  }

  async updateTransactionOutNull(
    entityManager: EntityManager,
    invoiceId: number,
    spbId: number,

  ): Promise<void> {
    const trans = await entityManager.find(TransactionOut, { where: { invoiceId: null } })
    console.log(trans);
    await entityManager.update(TransactionOut,
      { invoiceId: null },
      { invoiceId, spbId },
    );
    return;
  }

  async createTransactionOut(createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto): Promise<Invoice> {
    const transaction = await this.transactionOutRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        console.log("masuk")
        let amount: number = 0;
        let totalQty: number = 0;
        const customerId = createTransactionOutWithSpbDto.customerId;
        const noPlat = createTransactionOutWithSpbDto.no_plat;
        const clockOut = createTransactionOutWithSpbDto.clock_out;

        const totalConvertedQty: number = createTransactionOutWithSpbDto.transaction_outs.reduce((sum, transaction) => sum + transaction.converted_qty, 0);
        console.log(totalConvertedQty)

        let totalCharge: number = 0

        let totalFine: number = 0

        for (const transactionOut of createTransactionOutWithSpbDto.transaction_outs) {
          //locking product
          const product = await this.productService.lockingProductById(
            entityManager,
            transactionOut.productId,
          );

          let productQty: number = transactionOut.converted_qty

          //perhitungan harga
          let totalPrice: number = transactionOut.converted_qty * product.price
          amount += totalPrice

          const productTransactionIns = await this.transactionInService.getTransactionInsWithRemainingQty(product.id, customerId)
          for (const transactionIn of productTransactionIns) {
            if (productQty == 0) { break; }
            let qtyOut: number;
            let totalDays: number;

            //locking trans in
            await this.transactionInService.lockingTransactionInById(entityManager, transactionIn.id)

            //menghitung charga(keluar diluar jam kerja) 
            let charge: number = 0;
            // let chargeTransIn: number
            const valueCharge = await this.chargeService.findChargeById(1)
            let chargeAmount: number = 0
            if (valueCharge.type == "percentage") {
              chargeAmount = valueCharge.amount * totalPrice / 100
            } else {
              chargeAmount = valueCharge.amount
            }

            console.log(chargeAmount);

            if (isOutsideBusinessHours(new Date)) {
              console.log('charge out')
              charge += chargeAmount
            }
            // mengecek charge masuk nya juga !!!
            if (isOutsideBusinessHours(transactionIn.created_at)) {
              console.log("charge in")
              // chargeTransIn = 5000
              charge += chargeAmount
            }

            totalCharge += charge //+ chargeTransIn

            //menghitung fine (30 hari kerja lewat 1 detik saja harga x 2)
            let fine: number = 0;
            if (isPastDays(transactionIn.created_at, 120)) {
              fine = totalPrice * 4;
            } else if (isPastDays(transactionIn.created_at, 90)) {
              fine = totalPrice * 3;
            } else if (isPastDays(transactionIn.created_at, 60)) {
              fine = totalPrice * 2;
            } else if (isPastDays(transactionIn.created_at, 30)) {
              fine = totalPrice;
            }

            totalDays = pastDaysCount(transactionIn.created_at);
            totalFine += fine;

            if (transactionIn.remaining_qty > productQty) {
              //tidak mengecek qty di product karena sudah pasti ada jikalau di transaction in ada qty sisa
              // kurangi stock product dan di transaction in
              await this.productService.withdrawProductQtyWithEntityManager(
                entityManager,
                product,
                productQty,)

              await this.transactionInService.withdrawRemainingQtyWithEntityManager(
                entityManager,
                transactionIn,
                productQty,)

              //harus di convert ke unit product in
              qtyOut = productQty / transactionIn.conversion_to_kg
              totalQty += qtyOut
              transactionOut.converted_qty = productQty
              productQty = 0
            } else {
              productQty -= transactionIn.remaining_qty

              qtyOut = transactionIn.remaining_qty / transactionIn.conversion_to_kg
              totalQty += qtyOut

              transactionOut.converted_qty = transactionIn.remaining_qty

              await this.productService.withdrawProductQtyWithEntityManager(
                entityManager,
                product,
                transactionIn.remaining_qty,)

              await this.transactionInService.withdrawRemainingQtyWithEntityManager(
                entityManager,
                transactionIn,
                transactionIn.remaining_qty,)

              //harus di converted ke unit product in

            }


            //sign data
            transactionOut.productId = transactionIn.productId
            transactionOut.customerId = customerId
            transactionOut.conversion_to_kg = transactionIn.conversion_to_kg
            transactionOut.qty = qtyOut
            // transactionOut.converted_qty = productQty // ini harus sebelum di kurang
            //invoice id?
            transactionOut.price = product.price
            //spd id??
            transactionOut.total_charge = charge
            //charge in?
            transactionOut.total_days = totalDays
            transactionOut.total_fine = fine;
            transactionOut.total_price = product.price * transactionOut.converted_qty
            transactionOut.unit = transactionIn.unit;
            transactionOut.transaction_inId = transactionIn.id

            console.log(transactionOut);

            const transactionOutSave = entityManager.create(
              TransactionOut,
              transactionOut,
            );
            //save 
            await entityManager.save(transactionOutSave);
          }
        }
        const createInvoice = new CreateInvoiceDto();
        createInvoice.total_amount = amount;
        createInvoice.customerId = customerId;
        createInvoice.discount = 0;
        createInvoice.fine = totalFine;
        createInvoice.invoice_no = "CUSTOMERID-INCREMENT";
        createInvoice.status = "PENDING";
        createInvoice.tax = 0;
        createInvoice.total_order = totalQty;
        createInvoice.total_order_converted = totalConvertedQty;
        createInvoice.charge = totalCharge;

        console.log(createInvoice);

        const invoice = await this.invoiceService.createInvoice(createInvoice, entityManager)


        const createSpb = new CreateSpbDto();
        createSpb.clock_out = clockOut;
        createSpb.invoiceId = invoice.id
        createSpb.customerId = customerId;
        createSpb.no_plat = noPlat;

        const spb = await this.spbService.createSpb(createSpb, entityManager);

        const createAr = new CreateArDto();
        createAr.ar_no = invoice.invoice_no
        createAr.customerId = customerId;
        createAr.invoiceId = invoice.id
        createAr.status = "PENDING";
        createAr.to_paid = (invoice.total_amount + invoice.fine + invoice.charge + invoice.tax) - invoice.discount
        createAr.paid_date = null;
        createAr.total_bill = (invoice.total_amount + invoice.fine + invoice.charge + invoice.tax) - invoice.discount
        const ar = await this.arService.createAr(createAr, entityManager);

        console.log(invoice.id)
        console.log(spb.id)

        await this.updateTransactionOutNull(entityManager, invoice.id, spb.id)
        return invoice;
      },
    );
    return transaction;
  }

  async updateTransactionOut(
    transactionOutId: number,
    updateTransactionOutDto: UpdateTransactionOutDto,
  ): Promise<TransactionOut> {
    const transactionOut = await this.findTransactionOutById(transactionOutId);

    Object.assign(transactionOut, updateTransactionOutDto);

    return this.transactionOutRepository.save(transactionOut);
  }
}
