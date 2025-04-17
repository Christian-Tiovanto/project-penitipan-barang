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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { Spb } from '../models/spb.entity';
import { SpbService } from '../services/spb.service';

@ApiTags(ApiTag.SPB)
@Controller('api/v1/spb')
export class SpbController {
  constructor(private readonly spbService: SpbService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Spb by Invoice Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get('by-invoice/:id')
  async getTransactionOutById(
    @Param('id', ParseIntPipe) invoiceId: number,
  ): Promise<Spb> {
    return await this.spbService.getSpbByInvoiceId(invoiceId);
  }
}
