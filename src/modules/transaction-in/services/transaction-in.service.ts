import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionIn } from '../models/transaction-in.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateTransactionInDto } from '../dtos/create-transaction-in.dto';
import { UpdateTransactionInDto } from '../dtos/update-transaction-in.dto';
import { MerchantService } from '@app/modules/merchant/services/merchant.service';
import { ProductService } from '@app/modules/product/services/product.service';
import { ProductUnitService } from '@app/modules/product-unit/services/product-unit.service';

interface GetAllSupplier {
  pageNo: number;
  pageSize: number;
}

@Injectable()
export class TransactionInService {
  constructor(
    @InjectRepository(TransactionIn)
    private transactionInRepository: Repository<TransactionIn>,
    private merchantService: MerchantService,
    private productService: ProductService,
    private productUnitService: ProductUnitService,
  ) {}

  async createTransactionIn(
    createTransactionInDto: CreateTransactionInDto,
  ): Promise<TransactionIn> {
    await this.merchantService.findMerchantById(
      createTransactionInDto.merchant,
    );
    const productUnit = await this.productUnitService.findProductUnitById(
      createTransactionInDto.unit,
    );
    createTransactionInDto.qty =
      createTransactionInDto.qty * productUnit.conversion_to_kg;
    createTransactionInDto.conversion_to_kg = productUnit.conversion_to_kg;
    const transaction = await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const product = await this.productService.findProductById(
          createTransactionInDto.product,
        );
        createTransactionInDto.final_qty =
          createTransactionInDto.qty + product.qty;
        createTransactionInDto.remaining_qty = createTransactionInDto.qty;
        await this.productService.addProductQtyWithEntityManager(
          entityManager,
          product,
          createTransactionInDto.qty,
        );
        const transactionIn = entityManager.create(
          TransactionIn,
          createTransactionInDto,
        );
        const createdTransactionIn = await entityManager.save(transactionIn);
        return createdTransactionIn;
      },
    );

    return transaction;
  }

  async getAllTransactionIn({ pageNo, pageSize }: GetAllSupplier) {
    const skip = (pageNo - 1) * pageSize;
    const transactions = await this.transactionInRepository.findAndCount({
      skip,
      take: pageSize,
    });
    return transactions;
  }

  async findTransactionInById(id: number) {
    const transactionIn = await this.transactionInRepository.findOne({
      where: { id },
    });
    if (!transactionIn)
      throw new NotFoundException('No Transaction In with that id');
    return transactionIn;
  }

  async updateTransactionInByIdWithEM(
    transactionInId: number,
    updateTransactionInDto: UpdateTransactionInDto,
  ) {
    const transactionIn = await this.findTransactionInById(transactionInId);
    const productUnit = await this.productUnitService.findProductUnitById(
      updateTransactionInDto.unit,
    );
    updateTransactionInDto.qty =
      transactionIn.qty * productUnit.conversion_to_kg;
    await this.transactionInRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        await this.updateTransactionInProduct(
          transactionIn,
          updateTransactionInDto,
          entityManager,
        );

        updateTransactionInDto.remaining_qty = updateTransactionInDto.qty;
        Object.assign(transactionIn, updateTransactionInDto);
        await entityManager.save(transactionIn);
      },
    );
    return transactionIn;
  }

  private async updateTransactionInProductQty(
    transactionIn: TransactionIn,
    updateTransactionInDto: UpdateTransactionInDto,
    entityManager: EntityManager,
  ) {
    const product = await this.productService.findProductById(
      transactionIn.product,
    );
    const qtyToUpdate = transactionIn.qty - updateTransactionInDto.qty;
    product.qty = product.qty - qtyToUpdate;
    await this.productService.updateProductQtyWithEntityManager(
      entityManager,
      product,
    );
    updateTransactionInDto.final_qty = transactionIn.final_qty - qtyToUpdate;
  }

  private async updateTransactionInProduct(
    transactionIn: TransactionIn,
    updateTransactionInDto: UpdateTransactionInDto,
    entityManager: EntityManager,
  ) {
    if (transactionIn.product === updateTransactionInDto.product) {
      await this.updateTransactionInProductQty(
        transactionIn,
        updateTransactionInDto,
        entityManager,
      );
    } else {
      const previousProduct = await this.productService.findProductById(
        transactionIn.product,
      );
      previousProduct.qty = previousProduct.qty - transactionIn.qty;
      await this.productService.updateProductQtyWithEntityManager(
        entityManager,
        previousProduct,
      );
      const updatedToProduct = await this.productService.findProductById(
        updateTransactionInDto.product,
      );
      updateTransactionInDto.final_qty =
        updateTransactionInDto.qty + updatedToProduct.qty;
      await this.productService.addProductQtyWithEntityManager(
        entityManager,
        updatedToProduct,
        updateTransactionInDto.qty,
      );
    }
  }
}
