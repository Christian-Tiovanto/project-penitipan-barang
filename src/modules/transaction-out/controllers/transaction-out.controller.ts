import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionOutService } from '../services/transaction-out.service';
import { TransactionOut } from '../models/transaction-out.entity';
import { CreateTransactionOutDto, CreateTransactionOutWithSpbDto } from '../dtos/create-transaction-out.dto';
import { UpdateTransactionOutDto } from '../dtos/update-transaction-out.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { BasePaginationQuery, OffsetPagination } from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.TRANSACTION_OUT)
@Controller('api/v1/transaction-out')
export class TransactionOutController {
  constructor(private readonly transactionOutService: TransactionOutService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction Out',
  })
  @UseInterceptors(OffsetPaginationInterceptor<TransactionOut>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllTransactionOuts(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<TransactionOut>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const transactionOuts = await this.transactionOutService.getAllTransactionOuts({
      pageNo,
      pageSize,
    });
    return {
      data: transactionOuts[0],
      totalCount: transactionOuts[1],
      filteredCount: transactionOuts[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Transaction Out by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getTransactionOutById(
    @Param('id', ParseIntPipe) transactionOutId: number,
  ): Promise<TransactionOut> {
    return await this.transactionOutService.getTransactionOutById(transactionOutId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Transaction Out',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createTransactionOut(@Body() createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto) {
    console.log("masuk");
    return await this.transactionOutService.createTransactionOut(createTransactionOutWithSpbDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Transaction Out by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateTransactionOut(
    @Param('id', ParseIntPipe) transactionOutId: number,
    @Body() updateTransactionOutDto: UpdateTransactionOutDto,
  ) {
    return await this.transactionOutService.updateTransactionOut(transactionOutId, updateTransactionOutDto);
  }
}
