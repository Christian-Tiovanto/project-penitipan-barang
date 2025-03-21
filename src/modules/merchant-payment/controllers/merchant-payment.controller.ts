import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MerchantPaymentService } from '../services/merchant-payment.service';
import { MerchantPayment } from '../models/merchant-payment.entity';
import { CreateMerchantPaymentDto } from '../dtos/create-merchant-payment.dto';
import { UpdateMerchantPaymentDto } from '../dtos/update-merchant-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { BasePaginationQuery, OffsetPagination } from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.MERCHANT_PAYMENT)
@Controller('api/v1/merchant-payment')
export class MerchantPaymentController {
  constructor(private readonly merchantPaymentService: MerchantPaymentService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Merchant Payment',
  })
  @UseInterceptors(OffsetPaginationInterceptor<MerchantPayment>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllMerchantPayments(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<MerchantPayment>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const merchantPayments = await this.merchantPaymentService.getAllMerchantPayments({
      pageNo,
      pageSize,
    });
    return {
      data: merchantPayments[0],
      totalCount: merchantPayments[1],
      filteredCount: merchantPayments[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Merchant Payment by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getMerchantPaymentById(
    @Param('id', ParseIntPipe) merchantPaymentId: number,
  ): Promise<MerchantPayment> {
    return await this.merchantPaymentService.getMerchantPaymentById(merchantPaymentId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Merchant Payment',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createMerchantPayment(@Body() createMerchantPaymentDto: CreateMerchantPaymentDto) {
    return await this.merchantPaymentService.createMerchantPayment(createMerchantPaymentDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Merchant Payment by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateMerchantPayment(
    @Param('id', ParseIntPipe) merchantPaymentId: number,
    @Body() updateMerchantPaymentDto: UpdateMerchantPaymentDto,
  ) {
    return await this.merchantPaymentService.updateMerchantPayment(merchantPaymentId, updateMerchantPaymentDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Merchant Payment by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteMerchantPayment(@Param('id', ParseIntPipe) merchantPaymentId: number) {
    return await this.merchantPaymentService.deleteMerchantPayment(merchantPaymentId);
  }
}
