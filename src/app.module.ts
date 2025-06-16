import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DataValidationPipe } from './pipes/validation.pipe';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ExceptionHandlerFilter } from './filters/exception-handler.filter';
import { ProductModule } from './modules/product/product.module';
import { ProductUnitModule } from './modules/product-unit/product-unit.module';
import { CustomerModule } from './modules/customer/customer.module';
import { TransactionInModule } from './modules/transaction-in/transaction-in.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { CustomerPaymentModule } from './modules/customer-payment/customer-payment.module';
import { ArPaymentModule } from './modules/ar-payment/ar-payment.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { ChargeModule } from './modules/charge/charge.module';
import { TransactionOutModule } from './modules/transaction-out/transaction-out.module';
import { ReportModule } from './modules/report/report.module';
import { SpbModule } from './modules/spb/spb.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { UserSeeder } from './seeder/user.seeder';
import { AppSettingsModule } from './modules/app-settings/app-setting.module';
import { SecurityPinSeeder } from './seeder/security-pin.seeder';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  providers: [
    { provide: APP_PIPE, useClass: DataValidationPipe },
    { provide: APP_FILTER, useClass: ExceptionHandlerFilter },
    UserSeeder,
    SecurityPinSeeder,
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    // ProductModule,
    // ProductUnitModule,
    // CustomerModule,
    // TransactionInModule,
    // PaymentMethodModule,
    // CustomerPaymentModule,
    // ArPaymentModule,
    // CashflowModule,
    // ChargeModule,
    // TransactionOutModule,
    // ReportModule,
    // SpbModule,
    // InvoiceModule,
    AppSettingsModule,
  ],
})
export class AppModule {}
