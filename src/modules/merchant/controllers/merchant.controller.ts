import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MerchantService } from '../services/merchant.service';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { ApiTag } from '@app/enums/api-tags';
import { UpdateMerchantDto } from '../dtos/update-merchant.dto';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { Merchant } from '../models/merchant.entity';

@ApiTags(ApiTag.MERCHANT)
@Controller('api/v1/merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Merchant' })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createMerchant(@Body() createMerchantDto: CreateMerchantDto) {
    return await this.merchantService.createMerchant(createMerchantDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Merchant' })
  @UseInterceptors(OffsetPaginationInterceptor<Merchant>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllMerchant(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<Merchant>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const merchants = await this.merchantService.getAllMerchant({
      pageNo,
      pageSize,
    });
    return {
      data: merchants[0],
      totalCount: merchants[1],
      filteredCount: merchants[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a Merchant by Id' })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async findMerchantById(@Param('id', ParseIntPipe) merchantId: number) {
    return await this.merchantService.findMerchantById(merchantId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a Merchant by Id' })
  @UseGuards(AuthenticateGuard)
  @Patch(':id')
  async updateMerchantById(
    @Param('id', ParseIntPipe) merchantId: number,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return await this.merchantService.updateMerchantById(
      merchantId,
      updateMerchantDto,
    );
  }
}
