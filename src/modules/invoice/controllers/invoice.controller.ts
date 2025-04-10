import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { GetAllInvoiceQuery } from '../classes/invoice.query';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { GetAllInvoiceResponse } from '../classes/invoice.response';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { InvoiceSort, SortOrder } from '@app/enums/sort-order';

@ApiTags(ApiTag.INVOICE)
@Controller('api/v1/invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @ApiOkResponse({ type: GetAllInvoiceResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @Get()
  async getAllInvoices(
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

    const report = await this.invoiceService.getAllInvoices({
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
