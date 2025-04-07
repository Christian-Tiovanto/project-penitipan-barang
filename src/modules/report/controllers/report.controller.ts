import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { DateRangeQuery } from '@app/commons/queries/date-range.query';
import { ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';

@ApiTags(ApiTag.REPORT)
@Controller(ApiTag.REPORT)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

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
}
