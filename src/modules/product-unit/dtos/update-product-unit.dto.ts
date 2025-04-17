import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IProductUnit } from '../models/product-unit.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateProductUnitDto
  implements Partial<Omit<IProductUnit, 'id' | 'created_at' | 'updated_at'>>
{
  @ApiProperty({ example: 'Product Unit Name' })
  @JoiSchema(Joi.string().optional())
  name?: string;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  conversion_to_kg?: number;
}
