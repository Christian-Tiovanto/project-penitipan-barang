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
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
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
import { GetProductResponse } from '../classes/product.response';
import { GetAllProductQuery, ProductSort } from '../classes/product.query';
import { SortOrder } from '@app/enums/sort-order';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { ProductPermission } from '@app/enums/permission';

@ApiTags(ApiTag.PRODUCT)
@Controller('api/v1/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Product',
  })
  @PermissionsMetatada(ProductPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('/all')
  async getAllProducts(): Promise<Product[]> {
    return await this.productService.getAllProducts();
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: 'Get All Product Pagination',
  // })
  // @UseInterceptors(OffsetPaginationInterceptor<Product>)
  // @UseGuards(AuthenticateGuard)
  // @Get()
  // async getAllProductsPagination(
  //   @Query() { page_no, page_size }: BasePaginationQuery,
  // ): Promise<OffsetPagination<Product>> {
  //   const pageSize = parseInt(page_size) || 10;
  //   const pageNo = parseInt(page_no) || 1;

  //   const products = await this.productService.getAllProductsPagination({
  //     pageNo,
  //     pageSize,
  //   });
  //   return {
  //     data: products[0],
  //     totalCount: products[1],
  //     filteredCount: products[1],
  //   };
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Product Pagination',
  })
  @ApiOkResponse({ type: GetProductResponse })
  @UseInterceptors(OffsetPaginationInterceptor)
  @PermissionsMetatada(ProductPermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllProductsPagination(
    @Query()
    {
      page_no,
      page_size,
      start_date,
      end_date,
      sort,
      order,
      search,
    }: GetAllProductQuery,
  ): Promise<OffsetPagination<GetProductResponse>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;
    sort = !sort ? ProductSort.ID : sort;
    order = !order ? SortOrder.ASC : order;
    const products = await this.productService.getAllProductsPagination({
      pageNo,
      pageSize,
      sort,
      order,
      startDate: start_date,
      endDate: end_date,
      search,
    });
    return {
      data: products[0],
      totalCount: products[1],
      filteredCount: products[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Product by Id',
  })
  @PermissionsMetatada(ProductPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getProductById(
    @Param('id', ParseIntPipe) productId: number,
  ): Promise<Product> {
    return await this.productService.findProductById(productId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Product',
  })
  @PermissionsMetatada(ProductPermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productService.createProduct(createProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Product by Id',
  })
  @PermissionsMetatada(ProductPermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(productId, updateProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Product by Id',
  })
  @PermissionsMetatada(ProductPermission.DELETE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) productId: number) {
    return await this.productService.deleteProduct(productId);
  }
}
