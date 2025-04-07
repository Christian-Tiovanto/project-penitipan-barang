import { BasePaginationQuery } from '@app/interfaces/pagination.interface';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema } from 'joi-class-decorators';

export class OptionalDateRangeQueryWithPagination extends BasePaginationQuery {
  @ApiProperty({
    example: (() => {
      const today = new Date();
      return new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate(),
      );
    })(),
    required: false,
    description:
      'This parameter is inclusive which means the value is included in the filter.',
  })
  @JoiSchema(Joi.date().iso().options({ convert: true }).optional())
  start_date?: Date;

  @ApiProperty({
    example: (() => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    })(),
    required: false,
    description:
      'This parameter is exclusive which means the value is not included in the filter. Be',
  })
  @JoiSchema(
    Joi.when('start_date', {
      is: Joi.exist(),
      then: Joi.date()
        .iso()
        .options({ convert: true })
        .greater(Joi.ref('start_date'))
        .required(),
      otherwise: Joi.forbidden(),
    }),
  )
  end_date?: Date;
}
export class DateRangeQuery {
  @ApiProperty({
    example: (() => {
      const today = new Date();
      return new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate(),
      );
    })(),
    required: false,
    description:
      'This parameter is inclusive which means the value is included in the filter.',
  })
  @JoiSchema(Joi.date().iso().options({ convert: true }).required())
  start_date: Date;

  @ApiProperty({
    example: (() => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    })(),
    required: false,
    description:
      'This parameter is exclusive which means the value is not included in the filter. Be',
  })
  @JoiSchema(
    Joi.when('start_date', {
      is: Joi.exist(),
      then: Joi.date()
        .iso()
        .options({ convert: true })
        .greater(Joi.ref('start_date'))
        .required(),
      otherwise: Joi.forbidden(),
    }),
  )
  end_date: Date;
}
export class EndDateQuery {
  @ApiProperty({
    example: (() => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    })(),
    required: false,
    description:
      'This parameter is exclusive which means the value is not included in the filter. Be',
  })
  @JoiSchema(Joi.date().iso().options({ convert: true }).required())
  end_date: Date;
}
