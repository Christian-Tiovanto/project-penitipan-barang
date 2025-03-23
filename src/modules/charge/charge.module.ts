import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './models/charge.entity';
import { ChargeController } from './controllers/charge.controller';
import { ChargeService } from './services/charge.service';

@Module({
  imports: [TypeOrmModule.forFeature([Charge])],
  controllers: [ChargeController],
  providers: [ChargeService],
  exports: [ChargeService],
})
export class ChargeModule {}
