import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './models/invoice.entity';
import { InvoiceService } from './services/invoice.service';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice])],
    controllers: [],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule { }
