import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { IFine } from '../models/fine.entity';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateFineDto
  implements Omit<IFine, 'id' | 'created_at' | 'updated_at'>
{
  @ApiProperty({ example: 'Fine Name' })
  @JoiSchema(Joi.string().required())
  name: string;

  @ApiProperty({ example: 'Type Name' })
  @JoiSchema(Joi.string().required())
  type: string;

  @ApiProperty({ example: 1000 })
  @JoiSchema(Joi.number().integer().required())
  value: number;
}
