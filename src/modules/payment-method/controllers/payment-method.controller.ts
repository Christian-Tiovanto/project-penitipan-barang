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
import { PaymentMethodService } from '../services/payment-method.service';
import { PaymentMethod } from '../models/payment-method.entity';
import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { GetPaymentMethodResponse } from '../classes/payment-method.response';
import { GetAllUserQuery } from '@app/modules/user/classes/user.query';
import { GetUserResponse } from '@app/modules/user/classes/user.response';
import {
  GetAllPaymentMethodQuery,
  PaymentMethodSort,
} from '../classes/payment-method.query';
import { SortOrder } from '@app/enums/sort-order';
import { IntermediateGuard } from '@app/guards/intermediate.guard';

@ApiTags(ApiTag.PAYMENT_METHOD)
@Controller('api/v1/payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Payment Method',
  })
  @UseGuards(AuthenticateGuard)
  @Get('/all')
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await this.paymentMethodService.getAllPaymentMethods();
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Get All Payment Method Pagination',
  // })
  // @UseInterceptors(OffsetPaginationInterceptor<PaymentMethod>)
  // @UseGuards(AuthenticateGuard)
  // @Get()
  // async getAllPaymentMethodsPagination(
  //   @Query() { page_no, page_size }: BasePaginationQuery,
  // ): Promise<OffsetPagination<PaymentMethod>> {
  //   const pageSize = parseInt(page_size) || 10;
  //   const pageNo = parseInt(page_no) || 1;

  //   const paymentMethods =
  //     await this.paymentMethodService.getAllPaymentMethodsPagination({
  //       pageNo,
  //       pageSize,
  //     });
  //   return {
  //     data: paymentMethods[0],
  //     totalCount: paymentMethods[1],
  //     filteredCount: paymentMethods[1],
  //   };
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Payment Method Pagination',
  })
  @ApiOkResponse({ type: GetPaymentMethodResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllPaymentMethodsPagination(
    @Query()
    {
      page_no,
      page_size,
      start_date,
      end_date,
      sort,
      order,
      search,
    }: GetAllPaymentMethodQuery,
  ): Promise<OffsetPagination<GetPaymentMethodResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? PaymentMethodSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const paymentMethods =
      await this.paymentMethodService.getAllPaymentMethodsPagination({
        pageNo,
        pageSize,
        sort,
        order,
        startDate: start_date,
        endDate: end_date,
        search,
      });
    return {
      data: paymentMethods[0],
      totalCount: paymentMethods[1],
      filteredCount: paymentMethods[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Payment Method by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getPaymentMethodById(
    @Param('id', ParseIntPipe) paymentMethodId: number,
  ): Promise<PaymentMethod> {
    return await this.paymentMethodService.findPaymentMethodById(
      paymentMethodId,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Payment Method',
  })
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createPaymentMethod(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return await this.paymentMethodService.createPaymentMethod(
      createPaymentMethodDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Payment Method by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updatePaymentMethod(
    @Param('id', ParseIntPipe) paymentMethodId: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return await this.paymentMethodService.updatePaymentMethod(
      paymentMethodId,
      updatePaymentMethodDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Payment Method by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deletePaymentMethod(
    @Param('id', ParseIntPipe) paymentMethodId: number,
  ) {
    return await this.paymentMethodService.deletePaymentMethod(paymentMethodId);
  }
}
