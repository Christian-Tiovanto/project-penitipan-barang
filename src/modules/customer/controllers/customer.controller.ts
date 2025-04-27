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
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
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
import { GetCustomerResponse } from '../classes/customer.response';
import { CustomerSort, GetAllCustomerQuery } from '../classes/customer.query';
import { SortOrder } from '@app/enums/sort-order';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { CustomerPermission } from '@app/enums/permission';

@ApiTags(ApiTag.CUSTOMER)
@Controller('api/v1/customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Customer',
  })
  @PermissionsMetatada(CustomerPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/all')
  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerService.getAllCustomers();
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Get All Customer Pagination',
  // })
  // @UseInterceptors(OffsetPaginationInterceptor<Customer>)
  // @UseGuards(AuthenticateGuard)
  // @Get()
  // async getAllCustomersPagination(
  //   @Query() { page_no, page_size }: BasePaginationQuery,
  // ): Promise<OffsetPagination<Customer>> {
  //   const pageSize = parseInt(page_size) || 10;
  //   const pageNo = parseInt(page_no) || 1;

  //   const customers = await this.customerService.getAllCustomersPagination({
  //     pageNo,
  //     pageSize,
  //   });
  //   return {
  //     data: customers[0],
  //     totalCount: customers[1],
  //     filteredCount: customers[1],
  //   };
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Customer Pagination',
  })
  @ApiOkResponse({ type: GetCustomerResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @PermissionsMetatada(CustomerPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllCustomersPagination(
    @Query()
    {
      page_no,
      page_size,
      start_date,
      end_date,
      sort,
      order,
      search,
    }: GetAllCustomerQuery,
  ): Promise<OffsetPagination<GetCustomerResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? CustomerSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const customers = await this.customerService.getAllCustomersPagination({
      pageNo,
      pageSize,
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      search,
    });
    return {
      data: customers[0],
      totalCount: customers[1],
      filteredCount: customers[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Customer by Id',
  })
  @PermissionsMetatada(CustomerPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getCustomerById(
    @Param('id', ParseIntPipe) customerId: number,
  ): Promise<Customer> {
    return await this.customerService.findCustomerById(customerId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Customer',
  })
  @PermissionsMetatada(CustomerPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Customer by Id',
  })
  @PermissionsMetatada(CustomerPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateCustomer(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customerService.updateCustomer(
      customerId,
      updateCustomerDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Customer by Id',
  })
  @PermissionsMetatada(CustomerPermission.DELETE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteCustomer(@Param('id', ParseIntPipe) customerId: number) {
    return await this.customerService.deleteCustomer(customerId);
  }
}
