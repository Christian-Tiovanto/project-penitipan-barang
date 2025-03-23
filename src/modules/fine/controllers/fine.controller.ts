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
import { FineService } from '../services/fine.service';
import { Fine } from '../models/fine.entity';
import { CreateFineDto } from '../dtos/create-fine.dto';
import { UpdateFineDto } from '../dtos/update-fine.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTag } from '@app/enums/api-tags';
import { OffsetPaginationInterceptor } from '@app/interceptors/offset-pagination.interceptor';
import {
  BasePaginationQuery,
  OffsetPagination,
} from '@app/interfaces/pagination.interface';
import { AuthenticateGuard } from '@app/guards/authenticate.guard';
import { AuthorizeGuard } from '@app/guards/authorize.guard';

@ApiTags(ApiTag.FINE)
@Controller('api/v1/fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Fine',
  })
  @UseInterceptors(OffsetPaginationInterceptor<Fine>)
  @UseGuards(AuthenticateGuard)
  @Get()
  async getAllFines(
    @Query() { page_no, page_size }: BasePaginationQuery,
  ): Promise<OffsetPagination<Fine>> {
    const pageSize = parseInt(page_size) || 10;
    const pageNo = parseInt(page_no) || 1;

    const fines = await this.fineService.getAllFines({
      pageNo,
      pageSize,
    });
    return {
      data: fines[0],
      totalCount: fines[1],
      filteredCount: fines[1],
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Fine by Id',
  })
  @UseGuards(AuthenticateGuard)
  @Get(':id')
  async getFineById(@Param('id', ParseIntPipe) fineId: number): Promise<Fine> {
    return await this.fineService.findFineById(fineId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Fine',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Post()
  async createFine(@Body() createFineDto: CreateFineDto) {
    return await this.fineService.createFine(createFineDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Fine by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Patch(':id')
  async updateFine(
    @Param('id', ParseIntPipe) fineId: number,
    @Body() updateFineDto: UpdateFineDto,
  ) {
    return await this.fineService.updateFine(fineId, updateFineDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Fine by Id',
  })
  @UseGuards(AuthenticateGuard, AuthorizeGuard)
  @Delete(':id')
  async deleteFine(@Param('id', ParseIntPipe) fineId: number) {
    return await this.fineService.deleteFine(fineId);
  }
}
