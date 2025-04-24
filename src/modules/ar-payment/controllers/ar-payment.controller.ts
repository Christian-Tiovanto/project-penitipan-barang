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
import { ArPaymentService } from '../services/ar-payment.service';
import { ArPayment } from '../models/ar-payment.entity';
import { CreateArPaymentDto } from '../dtos/create-ar-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { CreateBulkArPaymentDto } from '../dtos/create-bulk-ar-payment.dto';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { ArPaymentPermission } from '@app/enums/permission';

@ApiTags(ApiTag.AR_PAYMENT)
@Controller('api/v1/ar-payment')
export class ArPaymentController {
  constructor(private readonly arPaymentService: ArPaymentService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Acc Receivable Payment',
  })
  @UseInterceptors(OffsetPaginationInterceptor<ArPayment>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllArPayments(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<ArPayment>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    const productUnits = await this.arPaymentService.getAllArPayments({
      pageNo,
      pageSize,
    });
    return {
      data: productUnits[0],
      totalCount: productUnits[1],
      filteredCount: productUnits[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Acc Receivable Payment by Id',
  })
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getProductUnitById(
    @Param('id', ParseIntPipe) arPaymentId: number,
  ): Promise<ArPayment> {
    return await this.arPaymentService.findArPaymentById(arPaymentId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Acc Receivable Payment',
  })
  @PermissionsMetatada(ArPaymentPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createArPayment(@Body() createArPaymentDto: CreateArPaymentDto) {
    return await this.arPaymentService.createArPayment(createArPaymentDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Bulk Acc Receivable Payment',
  })
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post('bulk')
  async createBulkArPayment(
    @Body() createBulkArPaymentDto: CreateBulkArPaymentDto,
  ) {
    return await this.arPaymentService.createBulkArPayment(
      createBulkArPaymentDto,
    );
  }
}
