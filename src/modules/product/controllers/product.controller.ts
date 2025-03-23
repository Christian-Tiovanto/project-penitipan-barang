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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.PRODUCT)
@Controller('api/v1/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Product',
  })
  @UseInterceptors(OffsetPaginationInterceptor<Product>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllProducts(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<Product>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const products = await this.productService.getAllProducts({
      pageNo,
      pageSize,
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
  @UseGuards(AuthenticateGuard)
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
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productService.createProduct(createProductDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Product by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
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
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) productId: number) {
    return await this.productService.deleteProduct(productId);
  }
}
