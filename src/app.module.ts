import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/user/models/user';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DataValidationPipe } from './pipes/validation.pipe';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ExceptionHandlerFilter } from './filters/exception-handler.filter';
import { ProductModule } from './modules/product/product.module';
import { ProductUnitModule } from './modules/product-unit/product-unit.module';
import { Product } from './modules/product/models/product.entity';
import { ProductUnit } from './modules/product-unit/models/product-unit.entity';
import { CustomerModule } from './modules/customer/customer.module';
import { Customer } from './modules/customer/models/customer.entity';
import { TransactionInModule } from './modules/transaction-in/transaction-in.module';
import { TransactionIn } from './modules/transaction-in/models/transaction-in.entity';
import { PaymentMethod } from './modules/payment-method/models/payment-method.entity';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { CustomerPaymentModule } from './modules/customer-payment/customer-payment.module';
import { CustomerPayment } from './modules/customer-payment/models/customer-payment.entity';
import { ArPaymentModule } from './modules/ar-payment/ar-payment.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { Cashflow } from './modules/cashflow/models/cashflow.entity';
import { ArPayment } from './modules/ar-payment/models/ar-payment.entity';
import { ChargeModule } from './modules/charge/charge.module';
import { Charge } from './modules/charge/models/charge.entity';
import { TransactionOut } from './modules/transaction-out/models/transaction-out.entity';
import { TransactionOutModule } from './modules/transaction-out/transaction-out.module';
import { Ar } from './modules/ar/models/ar.entity';
import { Spb } from './modules/spb/models/spb.entity';
import { Invoice } from './modules/invoice/models/invoice.entity';
import { ReportModule } from './modules/report/report.module';
import { SpbModule } from './modules/spb/spb.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { UserSeeder } from './seeder/user.seeder';
import { TransactionInHeader } from './modules/transaction-in/models/transaction-in-header.entity';
import { UserRole } from './modules/user/models/user-role';

@Module({
  providers: [
    { provide: APP_PIPE, useClass: DataValidationPipe },
    { provide: APP_FILTER, useClass: ExceptionHandlerFilter },
    UserSeeder,
  ],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Product,
        ProductUnit,
        Customer,
        TransactionIn,
        PaymentMethod,
        CustomerPayment,
        Cashflow,
        ArPayment,
        Charge,
        TransactionOut,
        Ar,
        Spb,
        Invoice,
        TransactionInHeader,
        UserRole,
      ],
      synchronize: true,
      logger: 'advanced-console',
      timezone: '+07:00',
      extra: {
        timezone: '+07:00',
      },
    }),
    UserModule,
    AuthModule,
    ProductModule,
    ProductUnitModule,
    CustomerModule,
    TransactionInModule,
    PaymentMethodModule,
    CustomerPaymentModule,
    ArPaymentModule,
    CashflowModule,
    ChargeModule,
    TransactionOutModule,
    ReportModule,
    SpbModule,
    InvoiceModule,
  ],
})
export class AppModule {}
