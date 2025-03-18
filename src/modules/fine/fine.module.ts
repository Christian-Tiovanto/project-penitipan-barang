import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fine } from './models/fine.entity';
import { FineController } from './controllers/fine.controller';
import { FineService } from './services/fine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fine])],
  controllers: [FineController],
  providers: [FineService],
  exports: [FineService],
})
export class FineModule { }
