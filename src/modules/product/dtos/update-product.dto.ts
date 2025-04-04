import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IProduct } from '../models/product.entity';

@JoiSchemaOptions({
  allowUnknown: false,
})
export class UpdateProductDto
  implements Partial<Omit<IProduct, 'id' | 'created_at' | 'updated_at'>>
{
  @ApiProperty({ example: 'Product Name' })
  @JoiSchema(Joi.string().optional())
  name?: string;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().optional())
  price?: number;

  // @ApiProperty({ example: 'http://example.com/image.jpg' })
  // @JoiSchema(Joi.string().uri().optional())
  // image_url?: string;

  // @ApiProperty({ example: 'filename.jpg' })
  // @JoiSchema(Joi.string().optional())
  // file_name?: string;

  @ApiProperty({ example: 10 })
  @JoiSchema(Joi.number().integer().optional())
  qty?: number;

  @ApiProperty({ example: 'Product description' })
  @JoiSchema(Joi.string().optional())
  desc?: string;

  @ApiProperty({ example: false })
  @JoiSchema(Joi.boolean().optional())
  is_deleted?: boolean;
}
