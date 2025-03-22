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
import { CustomerPaymentService } from '../services/customer-payment.service';
import { CustomerPayment } from '../models/customer-payment.entity';
import { CreateCustomerPaymentDto } from '../dtos/create-customer-payment.dto';
import { UpdateCustomerPaymentDto } from '../dtos/update-customer-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.CUSTOMER_PAYMENT)
@Controller('api/v1/customer-payment')
export class CustomerPaymentController {
  constructor(
    private readonly customerPaymentService: CustomerPaymentService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Customer Payment',
  })
  @UseInterceptors(OffsetPaginationInterceptor<CustomerPayment>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllCustomerPayments(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<CustomerPayment>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const merchantPayments =
      await this.customerPaymentService.getAllCustomerPayments({
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
    summary: 'Get Customer Payment by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getCustomerPaymentById(
    @Param('id', ParseIntPipe) customerPaymentId: number,
  ): Promise<CustomerPayment> {
    return await this.customerPaymentService.getCustomerrPaymentById(
      customerPaymentId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Customer Payment',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createCustomerPayment(
    @Body() createCustomerPaymentDto: CreateCustomerPaymentDto,
  ) {
    return await this.customerPaymentService.createCustomerPayment(
      createCustomerPaymentDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Merchant Payment by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateMerchantPayment(
    @Param('id', ParseIntPipe) customerPaymentId: number,
    @Body() updateCustomerPaymentDto: UpdateCustomerPaymentDto,
  ) {
    return await this.customerPaymentService.updateCustomerPayment(
      customerPaymentId,
      updateCustomerPaymentDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Customer Payment by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteCustomerPayment(
    @Param('id', ParseIntPipe) customerPaymentId: number,
  ) {
    return await this.customerPaymentService.deleteCustomerPayment(
      customerPaymentId,
    );
  }
}
