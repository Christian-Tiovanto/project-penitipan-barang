import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionInService } from '../services/transaction-in.service';
import { ApiTag } from '@app/enums/api-tags';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { CreateTransactionInDto } from '../dtos/create-transaction-in.dto';
import { UpdateTransactionInDto } from '../dtos/update-transaction-in.dto';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import {
  GetAllTransactionInQuery,
  TransactionInSort,
} from '../classes/transaction-in.query';
import { GetTransactionInResponse } from '../classes/transaction-in.response';
import { SortOrder } from '@app/enums/sort-order';
import { CreateBulkTransactionInDto } from '../dtos/create-bulk-transaction-in.dto';

@ApiTags(ApiTag.TRANSACTION_IN)
@Controller('api/v1/transaction-in')
export class TransactionInController {
  constructor(private readonly transactionInService: TransactionInService) {}

  @ApiOperation({ summary: 'Create a Transaction In' })
  @ApiBearerAuth()
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createTransactionIn(
    @Body() createTransactionInDto: CreateTransactionInDto,
  ) {
    return await this.transactionInService.createTransactionIn(
      createTransactionInDto,
    );
  }

  @ApiOperation({ summary: 'Create bulk Transaction In' })
  @ApiBearerAuth()
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post('bulk')
  async createBulkTransactionIn(
    @Body() createBulkTransactionInDto: CreateBulkTransactionInDto,
  ) {
    return await this.transactionInService.createBulkTransactionIn(
      createBulkTransactionInDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction In',
  })
  @ApiOkResponse({ type: GetTransactionInResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllTransactionIn(
    @Query()
    {
      page_no,
      page_size,
      sort,
      order,
      start_date,
      end_date,
      search,
    }: GetAllTransactionInQuery,
  ): Promise<OffsetPagination<GetTransactionInResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? TransactionInSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const transactions = await this.transactionInService.getAllTransactionIn({
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
    summary: 'Get Transaction In by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getTransactionInById(@Param('id', ParseIntPipe) supplierId: number) {
    return await this.transactionInService.findTransactionInById(supplierId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Transaction In by id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateTransactionInById(
    @Param('id', ParseIntPipe) supplierId: number,
    @Body() updateSupplierDto: UpdateTransactionInDto,
  ) {
    return await this.transactionInService.updateTransactionInByIdWithEM(
      supplierId,
      updateSupplierDto,
    );
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Get All Transaction In By Product Id',
  // })
  // @UseInterceptors(OffsetPaginationInterceptor)
  // @UseGuards(AuthenticateGuard)
  // @Get('by-product/:id')
  // async getAllTransactionInByProductId(
  //   @Param('id', ParseIntPipe) productId: number,
  //   @Query() { page_no, page_size }: BasePaginationQuery,
  // ): Promise<OffsetPagination<TransactionIn>> {
  //   const pageSize = parseInt(page_size) || 10;
  //   const pageNo = parseInt(page_no) || 1;
  //   const transactions =
  //     await this.transactionInService.getAllTransactionInByProductId(
  //       {
  //         pageNo,
  //         pageSize,
  //       },
  //       productId,
  //     );
  //   return {
  //     data: transactions[0],
  //     totalCount: transactions[1],
  //     filteredCount: transactions[1],
  //   };
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction In By Product Id',
  })
  @ApiOkResponse({ type: GetTransactionInResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @UseGuards(AuthenticateGuard)
  @Get('by-product/:id')
  async getAllTransactionInByProductId(
    @Param('id', ParseIntPipe) productId: number,
    @Query()
    {
      page_no,
      page_size,
      sort,
      order,
      start_date,
      end_date,
      search,
    }: GetAllTransactionInQuery,
  ): Promise<OffsetPagination<GetTransactionInResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? TransactionInSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const transactions =
      await this.transactionInService.getAllTransactionInByProductId(
        productId,
        {
          pageNo,
          pageSize,
          sort,
          order,
          startDate: start_date,
          endDate: end_date,
          search,
        },
      );
    return {
      data: transactions[0],
      totalCount: transactions[1],
      filteredCount: transactions[1],
    };
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Soft Delete Supplier by id',
  // })
  // @UseGuards(AuthenticateGuard, AuthorizeGuard)
  // @Delete(':id')
  // async softDeleteSupplierById(@Param('id', ParseIntPipe) supplierId: number) {
  //   return await this.transactionInService.softDeleteSupplierById(supplierId);
  // }
}
