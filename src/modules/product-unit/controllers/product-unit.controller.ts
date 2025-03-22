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
import { ProductUnitService } from '../services/product-unit.service';
import { ProductUnit } from '../models/product-unit.entity';
import { CreateProductUnitDto } from '../dtos/create-product-unit.dto';
import { UpdateProductUnitDto } from '../dtos/update-product-unit.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { BasePaginationQuery, OffsetPagination } from '@app/interfaces/pagination.interface';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.PRODUCT_UNIT)
@Controller('api/v1/product-unit')

export class ProductUnitController {
  constructor(private readonly productUnitService: ProductUnitService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Product Unit',
  })
  @UseInterceptors(OffsetPaginationInterceptor<ProductUnit>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllProductUnits(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<ProductUnit>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    const productUnits = await this.productUnitService.getAllProductUnits({
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
    summary: 'Get Product Unit by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getProductUnitById(
    @Param('id', ParseIntPipe) productUnitId: number,
  ): Promise<ProductUnit> {
    return await this.productUnitService.getProductUnitById(productUnitId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Product Unit',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createProductUnit(@Body() createProductDto: CreateProductUnitDto) {
    return await this.productUnitService.createProductUnit(createProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Product Unit by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateProductUnit(
    @Param('id', ParseIntPipe) productUnitId: number,
    @Body() updateProductDto: UpdateProductUnitDto,
  ) {
    return await this.productUnitService.updateProductUnit(productUnitId, updateProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Product Unit by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteProductUnit(@Param('id', ParseIntPipe) productUnitId: number) {
    return await this.productUnitService.deleteProductUnit(productUnitId);
  }
}
