import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { Spb } from '../models/spb.entity';
import { SpbService } from '../services/spb.service';
import { AuthorizeGuard } from '@app/guards/authorize.guard';
import { IntermediateGuard } from '@app/guards/intermediate.guard';
import { PermissionsMetatada } from '@app/decorators/permission.decorator';
import { SpbPermission } from '@app/enums/permission';

@ApiTags(ApiTag.SPB)
@Controller('api/v1/spb')
export class SpbController {
  constructor(private readonly spbService: SpbService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Spb by Invoice Id',
  })
  @PermissionsMetatada(SpbPermission.VIEW)
  @UseGuards(AuthenticateGuard, IntermediateGuard, AuthorizeGuard)
  @Get('by-invoice/:id')
  async getTransactionOutById(
    @Param('id', ParseIntPipe) invoiceId: number,
  ): Promise<Spb> {
    return await this.spbService.getSpbByInvoiceId(invoiceId);
  }
}
