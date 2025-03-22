import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/user/models/user';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DataValidationPipe } from './pipes/validation.pipe';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ExceptionHandlerFilter } from './filters/exception-handler.filter';
import { MerchantModule } from './modules/merchant/merchant.module';
import { Supplier } from './modules/supplier/models/supplier.entity';
import { SupplierModule } from './modules/supplier/supplier.module';
import { ProductModule } from './modules/product/product.module';
import { ProductUnitModule } from './modules/product-unit/product-unit.module';
import { Product } from './modules/product/models/product.entity';
import { ProductUnit } from './modules/product-unit/models/product-unit.entity';
import { FineModule } from './modules/fine/fine.module';
import { Fine } from './modules/fine/models/fine.entity';
import { CustomerModule } from './modules/customer/customer.module';
import { Customer } from './modules/customer/models/customer.entity';
import { TransactionInModule } from './modules/transaction-in/transaction-in.module';
import { TransactionIn } from './modules/transaction-in/models/transaction-in.entity';
import { Merchant } from './modules/merchant/models/merchant.entity';
import { PaymentMethod } from './modules/payment-method/models/payment-method.entity';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { CustomerPaymentModule } from './modules/customer-payment/customer-payment.module';
import { CustomerPayment } from './modules/customer-payment/models/customer-payment.entity';
import { ArPaymentModule } from './modules/ar-payment/ar-payment.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { Cashflow } from './modules/cashflow/models/cashflow.entity';
import { ArPayment } from './modules/ar-payment/models/ar-payment.entity';

@Module({
  providers: [
    { provide: APP_PIPE, useClass: DataValidationPipe },
    { provide: APP_FILTER, useClass: ExceptionHandlerFilter },
  ],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Merchant,
        Supplier,
        Product,
        ProductUnit,
        Fine,
        Customer,
        TransactionIn,
        PaymentMethod,
        CustomerPayment,
        Cashflow,
        ArPayment,
      ],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    MerchantModule,
    SupplierModule,
    ProductModule,
    ProductUnitModule,
    FineModule,
    CustomerModule,
    TransactionInModule,
    PaymentMethodModule,
    CustomerPaymentModule,
    ArPaymentModule,
    CashflowModule,
  ],
})
export class AppModule {}
