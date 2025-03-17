import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from '../models/supplier.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateSupplierDto } from '../dtos/create-supplier.dto';
import { ErrorCode } from '@app/enums/error-code';
import { RegexPatterns } from '@app/enums/regex-pattern';
import { UpdateSupplierDto } from '../dtos/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async createSupplier(
    userId: number,
    createSupplierDto: CreateSupplierDto,
  ): Promise<Supplier> {
    let createdSupplier: Supplier;
    try {
      createSupplierDto.created_by = userId;
      const supplier = this.supplierRepository.create(createSupplierDto);
      createdSupplier = await this.supplierRepository.save(supplier);
    } catch (err) {
      console.log('err');
      console.log(err);
      const queryError = err as QueryFailedError & {
        driverError: { errno: ErrorCode; sqlMessage: string };
      };
      if (queryError.driverError.errno === ErrorCode.DUPLICATE_ENTRY) {
        const duplicateValue = new RegExp(RegexPatterns.DuplicateEntry).exec(
          queryError.driverError.sqlMessage,
        );
        throw new ConflictException(`${duplicateValue[1]} value already exist`);
      }
    }
    return createdSupplier;
  }

  async getAllSupplier() {
    const suppliers = await this.supplierRepository.find();
    return suppliers;
  }

  async findSupplierById(id: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });
    if (!supplier) throw new NotFoundException('No Supplier with that id');
    return supplier;
  }

  async updateSupplierById(
    userId: number,
    supplierId: number,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    const supplier = await this.findSupplierById(supplierId);
    updateSupplierDto.updated_by = userId;
    Object.assign(supplier, updateSupplierDto);
    await this.supplierRepository.save(supplier);
    return supplier;
  }
}
