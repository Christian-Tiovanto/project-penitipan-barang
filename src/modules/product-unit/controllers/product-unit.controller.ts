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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPagination } from '@app/interfaces/pagination.interface';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { GetProductUnitResponse } from '../classes/product-unit.response';
import {
  GetAllProductUnitQuery,
  ProductUnitSort,
} from '../classes/product-unit.query';
import { SortOrder } from '@app/enums/sort-order';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { ProductUnitPermission } from '@app/enums/permission';

@ApiTags(ApiTag.PRODUCT_UNIT)
@Controller('api/v1/product-unit')
export class ProductUnitController {
  constructor(private readonly productUnitService: ProductUnitService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Product Unit',
  })
  @PermissionsMetatada(ProductUnitPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/all')
  async getAllProductUnits(): Promise<ProductUnit[]> {
    return await this.productUnitService.getAllProductUnits();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Product Unit with Pagination',
  })
  @ApiOkResponse({ type: GetProductUnitResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @PermissionsMetatada(ProductUnitPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllProductUnitsPagination(
    @Query()
    { page_no, page_size, sort, order, search }: GetAllProductUnitQuery,
  ): Promise<OffsetPagination<GetProductUnitResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? ProductUnitSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const productUnits =
      await this.productUnitService.getAllProductUnitsPagination({
        pageNo,
        pageSize,
        sort,
        order,
        search,
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
  @PermissionsMetatada(ProductUnitPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getProductUnitById(
    @Param('id', ParseIntPipe) productUnitId: number,
  ): Promise<ProductUnit> {
    return await this.productUnitService.findProductUnitById(productUnitId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Product Unit',
  })
  @PermissionsMetatada(ProductUnitPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createProductUnit(@Body() createProductDto: CreateProductUnitDto) {
    return await this.productUnitService.createProductUnit(createProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Product Unit by Id',
  })
  @PermissionsMetatada(ProductUnitPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateProductUnit(
    @Param('id', ParseIntPipe) productUnitId: number,
    @Body() updateProductDto: UpdateProductUnitDto,
  ) {
    return await this.productUnitService.updateProductUnit(
      productUnitId,
      updateProductDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Product Unit by Id',
  })
  @PermissionsMetatada(ProductUnitPermission.DELETE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteProductUnit(@Param('id', ParseIntPipe) productUnitId: number) {
    return await this.productUnitService.deleteProductUnit(productUnitId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Product Unit by Product Id',
  })
  @PermissionsMetatada(ProductUnitPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/by-product/:id')
  async getProductUnitByProductId(
    @Param('id', ParseIntPipe) productId: number,
  ) {
    return await this.productUnitService.getProductUnitsByProductId(productId);
  }
}
