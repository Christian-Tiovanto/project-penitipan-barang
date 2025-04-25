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
import { ChargeService } from '../services/charge.service';
import { Charge } from '../models/charge.entity';
import { CreateChargeDto } from '../dtos/create-charge.dto';
import { UpdateChargeDto } from '../dtos/update-charge.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { ChargePermission } from '@app/enums/permission';

@ApiTags(ApiTag.CHARGE)
@Controller('api/v1/charge')
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Charge',
  })
  @UseInterceptors(OffsetPaginationInterceptor<Charge>)
  @PermissionsMetatada(ChargePermission.LIST)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get()
  async getAllCharge(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<Charge>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const charges = await this.chargeService.getAllCharge({
      pageNo,
      pageSize,
    });
    return {
      data: charges[0],
      totalCount: charges[1],
      filteredCount: charges[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Charge by Id',
  })
  @PermissionsMetatada(ChargePermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get(':id')
  async getChargeById(
    @Param('id', ParseIntPipe) chargeId: number,
  ): Promise<Charge> {
    return await this.chargeService.findChargeById(chargeId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Charge',
  })
  @PermissionsMetatada(ChargePermission.CREATE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Post()
  async createCharge(@Body() createChargeDto: CreateChargeDto) {
    return await this.chargeService.createCharge(createChargeDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Charge by Id',
  })
  @PermissionsMetatada(ChargePermission.EDIT)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateCharge(
    @Param('id', ParseIntPipe) chargeId: number,
    @Body() updateChargeDto: UpdateChargeDto,
  ) {
    return await this.chargeService.updateCharge(chargeId, updateChargeDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Charge by Id',
  })
  @PermissionsMetatada(ChargePermission.DELETE)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteCharge(@Param('id', ParseIntPipe) chargeId: number) {
    return await this.chargeService.deleteCharge(chargeId);
  }
}
