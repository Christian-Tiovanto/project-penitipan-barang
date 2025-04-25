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
import { GetCustomerPaymentResponse } from '../classes/customer-payment.response';
import {
  CustomerPaymentSort,
  GetAllCustomerPaymentQuery,
} from '../classes/customer-payment.query';
import { SortOrder } from '@app/enums/sort-order';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { CustomerPaymentPermission } from '@app/enums/permission';

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
  @PermissionsMetatada(CustomerPaymentPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/all')
  async getAllCustomerPayments(): Promise<CustomerPayment[]> {
    return await this.customerPaymentService.getAllCustomerPayments();
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Get All Customer Payment Pagination',
  // })
  // @UseInterceptors(OffsetPaginationInterceptor<CustomerPayment>)
  // @UseGuards(AuthenticateGuard)
  // @Get()
  // async getAllCustomerPaymentsPagination(
  //   @Query() { page_no, page_size }: BasePaginationQuery,
  // ): Promise<OffsetPagination<CustomerPayment>> {
  //   const pageSize = parseInt(page_size) || 10;
  //   const pageNo = parseInt(page_no) || 1;

  //   const merchantPayments =
  //     await this.customerPaymentService.getAllCustomerPaymentsPagination({
  //       pageNo,
  //       pageSize,
  //     });
  //   return {
  //     data: merchantPayments[0],
  //     totalCount: merchantPayments[1],
  //     filteredCount: merchantPayments[1],
  //   };
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Customer Payment In Pagination',
  })
  @ApiOkResponse({ type: GetCustomerPaymentResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @PermissionsMetatada(CustomerPaymentPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllCustomerPaymentsPagination(
    @Query()
    {
      page_no,
      page_size,
      sort,
      order,
      start_date,
      end_date,
      search,
    }: GetAllCustomerPaymentQuery,
  ): Promise<OffsetPagination<GetCustomerPaymentResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? CustomerPaymentSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const customerPayments =
      await this.customerPaymentService.getAllCustomerPaymentsPagination({
        pageNo,
        pageSize,
        sort,
        order,
        startDate: start_date,
        endDate: end_date,
        search,
      });
    return {
      data: customerPayments[0],
      totalCount: customerPayments[1],
      filteredCount: customerPayments[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Customer Payment by Id',
  })
  @PermissionsMetatada(CustomerPaymentPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getCustomerPaymentById(
    @Param('id', ParseIntPipe) customerPaymentId: number,
  ): Promise<CustomerPayment> {
    return await this.customerPaymentService.findCustomerPaymentById(
      customerPaymentId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Customer Payment',
  })
  @PermissionsMetatada(CustomerPaymentPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
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
  @PermissionsMetatada(CustomerPaymentPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
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
  @PermissionsMetatada(CustomerPaymentPermission.DELETE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteCustomerPayment(
    @Param('id', ParseIntPipe) customerPaymentId: number,
  ) {
    return await this.customerPaymentService.deleteCustomerPayment(
      customerPaymentId,
    );
  }
}
