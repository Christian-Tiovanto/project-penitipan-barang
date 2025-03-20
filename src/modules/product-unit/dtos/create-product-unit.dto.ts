import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IProductUnit } from '../models/product-unit.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateProductUnitDto
  implements Omit<IProductUnit, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 1 })
  @JoiSchema(Joi.number().required())
  product: number;

  @ApiProperty({ example: 'Kotak' })
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  qty: number;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().required())
  conversion_to_kg: number;
}
