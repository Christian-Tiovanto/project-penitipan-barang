import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { DateRangeQuery } from '@app/commons/queries/date-range.query';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import {
  AgingReportQuery,
  ArPaidReportQuery,
  StockInvoiceReportQuery,
  StockReportQuery,
} from '../classes/report.query';
import { NettIncomeReportResponse } from '../classes/report.response';
import { ArSort, SortOrder } from '@app/enums/sort-order';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { GetAllArResponse } from '@app/modules/ar/classes/ar.response';
import { parseBoolean } from '@app/utils/parse-boolean';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { ReportPermission } from '@app/enums/permission';
@ApiTags(ApiTag.REPORT)
@UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
@PermissionsMetatada(ReportPermission.LIST)
@ApiBearerAuth()
@Controller(`api/v1/${ApiTag.REPORT}`)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @PermissionsMetatada(ReportPermission.LIST)
  @Get('stock-book/product/:product_id/customer/:customer_id')
  async stockBookReport(
    @Param('product_id', ParseIntPipe) productId: number,
    @Param('customer_id', ParseIntPipe) customerId: number,
    @Query() { start_date, end_date }: DateRangeQuery,
  ) {
    return await this.reportService.stockBookReport(productId, customerId, {
      startDate: start_date,
      endDate: end_date,
    });
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @Get('cashflow-report')
  async cashflowReport(@Query() { start_date, end_date }: DateRangeQuery) {
    return await this.reportService.cashflowReport({
      startDate: start_date,
      endDate: end_date,
    });
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @Get('stock-report')
  async stockReport(@Query() { end_date, customer }: StockReportQuery) {
    return await this.reportService.stockReport(end_date, parseInt(customer));
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @Get('customer-mutation-stock/:customer_id')
  async customerProductMutationReport(
    @Query() { start_date, end_date }: DateRangeQuery,
    @Param('customer_id', ParseIntPipe) customerId: number,
  ) {
    return await this.reportService.customerProductMutationReport(customerId, {
      startDate: start_date,
      endDate: end_date,
    });
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @Get('stock-invoice-report')
  async stockInvoiceReport(@Query() { invoice }: StockInvoiceReportQuery) {
    return await this.reportService.stockInvoiceReport(parseInt(invoice));
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @Get('aging-report')
  async agingReport(@Query() { customer }: AgingReportQuery) {
    return await this.reportService.agingReport(parseInt(customer));
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @ApiOkResponse({ type: NettIncomeReportResponse })
  @Get('nett-income-report')
  async nettIncomeReport(@Query() { start_date, end_date }: DateRangeQuery) {
    return await this.reportService.nettIncomeReport({
      startDate: start_date,
      endDate: end_date,
    });
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @ApiOkResponse({ type: GetAllArResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @Get('ar')
  async arList(
    @Query()
    {
      start_date,
      end_date,
      page_no,
      page_size,
      sort,
      order,
      customer,
      compact,
      with_payment,
      status,
    }: ArPaidReportQuery,
  ): Promise<OffsetPagination<GetAllArResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? ArSort.ID : sort;
    order = !order ? SortOrder.ASC : order;

    const report = await this.reportService.arList({
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      pageNo,
      pageSize,
      customer,
      status,
      compact: parseBoolean(compact),
      with_payment: parseBoolean(with_payment),
    });
    return {
      data: report[0],
      totalCount: report[1],
      filteredCount: report[1],
    };
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @ApiOkResponse({ type: GetAllArResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @Get('ar-paid-report')
  async arPaidReport(
    @Query()
    {
      start_date,
      end_date,
      page_no,
      page_size,
      sort,
      order,
      customer,
      compact,
      with_payment,
      status,
    }: ArPaidReportQuery,
  ): Promise<OffsetPagination<GetAllArResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? ArSort.ID : sort;
    order = !order ? SortOrder.ASC : order;

    const report = await this.reportService.arPaidReport({
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      pageNo,
      pageSize,
      customer,
      status,
      compact: parseBoolean(compact),
      with_payment: parseBoolean(with_payment),
    });
    return {
      data: report[0],
      totalCount: report[1],
      filteredCount: report[1],
    };
  }

  @PermissionsMetatada(ReportPermission.LIST)
  @ApiOkResponse({ type: GetAllArResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @Get('to-paid-report')
  async arToPaidReport(
    @Query()
    {
      start_date,
      end_date,
      page_no,
      page_size,
      sort,
      order,
      customer,
      compact,
      with_payment,
      status,
    }: ArPaidReportQuery,
  ): Promise<OffsetPagination<GetAllArResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? ArSort.ID : sort;
    order = !order ? SortOrder.ASC : order;

    const report = await this.reportService.arToPaidReport({
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      pageNo,
      pageSize,
      customer,
      status,
      compact: parseBoolean(compact),
      with_payment: parseBoolean(with_payment),
    });
    return {
      data: report[0],
      totalCount: report[1],
      filteredCount: report[1],
    };
  }
}
