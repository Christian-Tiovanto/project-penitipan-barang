import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionOut } from './models/transaction-out.entity';
import { TransactionOutController } from './controllers/transaction-out.controller';
import { TransactionOutService } from './services/transaction-out.service';
import { ProductModule } from '../product/product.module';
import { TransactionInModule } from '../transaction-in/transaction-in.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { ArModule } from '../ar/ar.module';
import { SpbModule } from '../spb/spb.module';
import { ChargeModule } from '../charge/charge.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOut]),
    ProductModule,
    TransactionInModule,
    InvoiceModule,
    ArModule,
    SpbModule,
    ChargeModule,
    CustomerModule,
  ],
  controllers: [TransactionOutController],
  providers: [TransactionOutService],
  exports: [TransactionOutService],
})
export class TransactionOutModule { }
