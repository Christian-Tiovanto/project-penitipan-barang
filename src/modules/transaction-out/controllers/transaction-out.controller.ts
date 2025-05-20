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
import {
  CreateTransactionOutFifoWithSpbDto,
  CreateTransactionOutWithSpbDto,
} from '../dtos/create-transaction-out.dto';
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
import { GetTransactionOutResponse } from '../classes/transaction-out.response';
import { SortOrder } from '@app/enums/sort-order';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { TransactionOutPermission } from '@app/enums/permission';

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
  @PermissionsMetatada(TransactionOutPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
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
  @PermissionsMetatada(TransactionOutPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
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
  @PermissionsMetatada(TransactionOutPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createTransactionOut(
    @Body() createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto,
  ) {
    return await this.transactionOutService.createTransactionOut(
      createTransactionOutWithSpbDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Transaction Out Fifo',
  })
  @PermissionsMetatada(TransactionOutPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post('/fifo')
  async createTransactionOutFifo(
    @Body()
    createTransactionOutFifoWithSpbDto: CreateTransactionOutFifoWithSpbDto,
  ) {
    return await this.transactionOutService.createTransactionOutFifo(
      createTransactionOutFifoWithSpbDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Preview Transaction Out',
  })
  @PermissionsMetatada(TransactionOutPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post('/preview')
  async previewTransactionOut(
    @Body() createTransactionOutWithSpbDto: CreateTransactionOutWithSpbDto,
  ) {
    return await this.transactionOutService.previewTransactionOut(
      createTransactionOutWithSpbDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Preview Transaction Out Fifo',
  })
  @PermissionsMetatada(TransactionOutPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post('/preview/fifo')
  async previewTransactionOutFifo(
    @Body()
    createTransactionOutFifoWithSpbDto: CreateTransactionOutFifoWithSpbDto,
  ) {
    return await this.transactionOutService.previewTransactionOutFifo(
      createTransactionOutFifoWithSpbDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction Out By Invoice Id',
  })
  @PermissionsMetatada(TransactionOutPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/by-invoice/:id')
  async getTransactionOutsByInvoiceId(
    @Param('id', ParseIntPipe) invoiceId: number,
  ): Promise<TransactionOut[]> {
    return await this.transactionOutService.getTransactionOutsByInvoiceId(
      invoiceId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Transaction Out By Invoice Id',
  })
  @PermissionsMetatada(TransactionOutPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/by-invoice-brg-luar/:id')
  async getTransactionOutsByInvoiceIdWithBrgLuar(
    @Param('id', ParseIntPipe) invoiceId: number,
  ): Promise<TransactionOut[]> {
    return await this.transactionOutService.getTransactionOutsByInvoiceIdWithBrgLuar(
      invoiceId,
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
