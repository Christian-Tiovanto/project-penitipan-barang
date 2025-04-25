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
import { CashflowService } from '../services/cashflow.service';
import { Cashflow } from '../models/cashflow.entity';
import { CreateCashflowDto } from '../dtos/create-cashflow.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { JwtPayload } from '@app/interfaces/jwt-payload.interface';
import { GetAllCashflowQuery } from '../classes/cashflow.query';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { CashflowPermission } from '@app/enums/permission';

@ApiTags(ApiTag.CASHFLOW)
@Controller('api/v1/cashflow')
export class CashflowController {
  constructor(private readonly cashflowService: CashflowService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Cashflow',
  })
  @UseInterceptors(OffsetPaginationInterceptor<Cashflow>)
  @PermissionsMetatada(CashflowPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllCashflows(
    @Query()
    { page_no, page_size, start_date, end_date, type }: GetAllCashflowQuery,
  ): Promise<OffsetPagination<Cashflow>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const cashflows = await this.cashflowService.getAllCashflows({
      pageNo,
      pageSize,
      startDate: start_date,
      endDate: end_date,
      type,
    });
    return {
      data: cashflows[0],
      totalCount: cashflows[1],
      filteredCount: cashflows[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Cashflow by Id',
  })
  @PermissionsMetatada(CashflowPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getCashflowById(
    @Param('id', ParseIntPipe) cashflowId: number,
  ): Promise<Cashflow> {
    return await this.cashflowService.findCashflowById(cashflowId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Cashflow',
  })
  @PermissionsMetatada(CashflowPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createCashflow(
    @Body() createCashflowDto: CreateCashflowDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return await this.cashflowService.createCashflow(
      currentUser.id,
      createCashflowDto,
    );
  }
}
