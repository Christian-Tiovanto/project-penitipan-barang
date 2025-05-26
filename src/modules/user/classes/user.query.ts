import { OptionalDateRangeQueryWithPagination } from '@app/commons/queries/date-range.query';
import { SortOrder } from '@app/enums/sort-order';
import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';
export enum UserSort {
  ID = 'id',
  EMAIL = 'email',
  FULLNAME = 'fullname',
  // PIN = 'pin',
}

export class GetAllUserQuery extends OptionalDateRangeQueryWithPagination {
  @ApiProperty({
    enum: UserSort,
    required: false,
    description: 'default sort by `id`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(UserSort))
      .optional(),
  )
  sort: UserSort;

  @ApiProperty({
    enum: SortOrder,
    required: false,
    description: 'default order is `asc`',
  })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(SortOrder))
      .optional(),
  )
  order?: SortOrder;

  @ApiProperty({
    example: '',
    description: 'Search User based on email,fullname,pin',
    required: false,
  })
  @JoiSchema(Joi.string().optional())
  search?: string;
}
