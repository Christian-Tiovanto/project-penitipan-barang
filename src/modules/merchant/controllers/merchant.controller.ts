import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MerchantService } from '../services/merchant.service';
import { CreateMerchantDto } from '../dtos/create-merchant.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { ApiTag } from '@app/enums/api-tags';
import { UpdateMerchantDto } from '../dtos/update-merchant.dto';

@ApiTags(ApiTag.MERCHANT)
@Controller('api/v1/merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Merchant' })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createMerchant(@Body() createMerchantDto: CreateMerchantDto) {
    return await this.merchantService.createMerchant(createMerchantDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Merchant' })
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllMerchant() {
    return await this.merchantService.getAllMerchant();
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
