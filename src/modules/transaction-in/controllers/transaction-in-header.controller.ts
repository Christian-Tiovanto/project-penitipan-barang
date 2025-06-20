import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { TransactionInPermission } from '@app/enums/permission';
import { UpdateTransactionInHeaderDto } from '../dtos/update-trans-in-header.dto';

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
  @PermissionsMetatada(TransactionInPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
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
  @PermissionsMetatada(TransactionInPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
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
  @PermissionsMetatada(TransactionInPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/by-customer/:id')
  async getAllProductUnits(
    @Param('id', ParseIntPipe) customerId: number,
  ): Promise<TransactionInHeader[]> {
    return await this.transactionInHeaderService.getAllTransactionInHeadersByCustomerId(
      customerId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Trans In Header',
  })
  @PermissionsMetatada(TransactionInPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateTransInHeader(
    @Param('id', ParseIntPipe) transInHeaderId: number,
    @Body() updateTransInHeaderDto: UpdateTransactionInHeaderDto,
  ): Promise<TransactionInHeader> {
    return await this.transactionInHeaderService.updateTransactionInHeader(
      transInHeaderId,
      updateTransInHeaderDto,
    );
  }
}
