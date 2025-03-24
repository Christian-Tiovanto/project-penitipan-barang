import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spb } from './models/spb.entity';
import { SpbService } from './services/spb.service';

@Module({
    imports: [TypeOrmModule.forFeature([Spb])],
    controllers: [],
    providers: [SpbService],
    exports: [SpbService],
})
export class SpbModule { }
