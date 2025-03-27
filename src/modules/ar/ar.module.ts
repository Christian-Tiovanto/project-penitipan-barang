import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ar } from './models/ar.entity';
import { ArService } from './services/ar.service';

@Module({
    imports: [TypeOrmModule.forFeature([Ar])],
    controllers: [],
    providers: [ArService],
    exports: [ArService],
})
export class ArModule { }
