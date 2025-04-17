import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTag } from '@app/enums/api-tags';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { GetTransactionInResponse } from '../classes/transaction-in.response';
import { SortOrder, TransactionInHeaderSort } from '@app/enums/sort-order';
import { TransactionInHeaderService } from '../services/transaction-in-header.service';
import { GetAllTransactionInHeaderQuery } from '../classes/transaction-in-header.query';
import { TransactionInHeader } from '../models/transaction-in-header.entity';

@ApiTags(ApiTag.TRANSACTION_IN_HEADER)
@Controller('api/v1/transaction-in-header')
export class TransactionInHeaderController {
  constructor(
    private readonly transactionInHeaderService: TransactionInHeaderService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction In Header',
  })
  @ApiOkResponse({ type: GetTransactionInResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllTransactionInHeader(
    @Query()
    {
      page_no,
      page_size,
      sort,
      order,
      start_date,
      end_date,
      search,
    }: GetAllTransactionInHeaderQuery,
  ) {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? TransactionInHeaderSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const transactions =
      await this.transactionInHeaderService.getAllTransactionInHeader({
        pageNo,
        pageSize,
        sort,
        order,
        startDate: start_date,
        endDate: end_date,
        search,
      });
    return {
      data: transactions[0],
      totalCount: transactions[1],
      filteredCount: transactions[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Transaction In Header by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getTransactionInHeaderById(
    @Param('id', ParseIntPipe) transactionInHeaderId: number,
  ) {
    return await this.transactionInHeaderService.findTransactionInHeaderById(
      transactionInHeaderId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Trans In Header By CustomerId',
  })
  @UseGuards(AuthenticateGuard)
  @Get('/by-customer/:id')
  async getAllProductUnits(
    @Param('id', ParseIntPipe) customerId: number,
  ): Promise<TransactionInHeader[]> {
    return await this.transactionInHeaderService.getAllTransactionInHeadersByCustomerId(
      customerId,
    );
  }
}
