import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionOutService } from '../services/transaction-out.service';
import { TransactionOut } from '../models/transaction-out.entity';
import { CreateTransactionOutWithSpbDto } from '../dtos/create-transaction-out.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import {
  GetAllTransactionOutQuery,
  TransactionOutSort,
} from '../classes/transaction-out.query';
import { GetTransactionOutResponse } from '../classes/transaction-in.response';
import { SortOrder } from '@app/enums/sort-order';

@ApiTags(ApiTag.TRANSACTION_OUT)
@Controller('api/v1/transaction-out')
export class TransactionOutController {
  constructor(private readonly transactionOutService: TransactionOutService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction Out',
  })
  @ApiOkResponse({ type: GetTransactionOutResponse })
  @UseInterceptors(OffsetPaginationInterceptor<TransactionOut>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllTransactionOuts(
    @Query()
    {
      page_no,
      page_size,
      sort,
      order,
      start_date,
      end_date,
    }: GetAllTransactionOutQuery,
  ): Promise<OffsetPagination<GetTransactionOutResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? TransactionOutSort.ID : sort;
    order = !order ? SortOrder.ASC : order;

    const transactionOuts =
      await this.transactionOutService.getAllTransactionOuts({
        pageNo,
        pageSize,
        sort,
        order,
        startDate: start_date,
        endDate: end_date,
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
    return await this.transactionOutService.getTransactionOutById(
      transactionOutId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Transaction Out',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createTransactionOut(
    @Body() createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto,
  ) {
    return await this.transactionOutService.createTransactionOut(
      createTransactionOutWithSpbDto,
    );
  }

  //   @ApiBearerAuth()
  //   @ApiOperation({
  //     summary: 'Update Transaction Out by Id',
  //   })
  //   @UseGuards(AuthenticateGuard, AuthorizeGuard)
  //   @Patch(':id')
  //   async updateTransactionOut(
  //     @Param('id', ParseIntPipe) transactionOutId: number,
  //     @Body() updateTransactionOutDto: UpdateTransactionOutDto,
  //   ) {
  //     return await this.transactionOutService.updateTransactionOut(transactionOutId, updateTransactionOutDto);
  //   }
}
