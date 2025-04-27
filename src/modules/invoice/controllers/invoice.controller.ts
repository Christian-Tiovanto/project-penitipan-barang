import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { GetAllInvoiceQuery } from '../classes/invoice.query';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { GetAllInvoiceResponse } from '../classes/invoice.response';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { InvoiceSort, SortOrder } from '@app/enums/sort-order';
import { Invoice } from '../models/invoice.entity';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { InvoicePermission } from '@app/enums/permission';

@ApiTags(ApiTag.INVOICE)
@Controller('api/v1/invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Invoices',
  })
  @PermissionsMetatada(InvoicePermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/all')
  async getAllInvoices(): Promise<Invoice[]> {
    return await this.invoiceService.getAllInvoices();
  }

  @ApiOkResponse({ type: GetAllInvoiceResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @PermissionsMetatada(InvoicePermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllInvoicesPagination(
    @Query()
    {
      start_date,
      end_date,
      page_no,
      page_size,
      sort,
      order,
      customer,
      status,
    }: GetAllInvoiceQuery,
  ): Promise<OffsetPagination<GetAllInvoiceResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? InvoiceSort.ID : sort;
    order = !order ? SortOrder.ASC : order;

    const report = await this.invoiceService.getAllInvoicesPagination({
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      pageNo,
      pageSize,
      customer,
      status,
    });
    return {
      data: report[0],
      totalCount: report[1],
      filteredCount: report[1],
    };
  }
}
