import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spb } from './models/spb.entity';
import { SpbService } from './services/spb.service';
import { SpbController } from './controllers/spb.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Spb])],
  controllers: [SpbController],
  providers: [SpbService],
  exports: [SpbService],
})
export class SpbModule {}
