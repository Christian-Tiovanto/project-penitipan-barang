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
import { SupplierService } from '../services/supplier.service';
import { ApiTag } from '@app/enums/api-tags';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { CreateSupplierDto } from '../dtos/create-supplier.dto';
import { UpdateSupplierDto } from '../dtos/update-supplier.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { JwtPayload } from '@app/interfaces/jwt-payload.interface';

@ApiTags(ApiTag.SUPPLIER)
@Controller('api/v1/supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @ApiOperation({ summary: 'Create a Supplier' })
  @ApiBearerAuth()
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return await this.supplierService.createSupplier(
      currentUser.id,
      createSupplierDto,
    );
  }
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Supplier',
  })
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllUser() {
    return await this.supplierService.getAllSupplier();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Supplier by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) supplierId: number) {
    return await this.supplierService.findSupplierById(supplierId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Supplier by id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) supplierId: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return await this.supplierService.updateSupplierById(
      currentUser.id,
      supplierId,
      updateSupplierDto,
    );
  }
}
