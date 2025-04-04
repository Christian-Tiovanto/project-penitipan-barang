// import { ApiProperty } from '@nestjs/swagger';
// import * as Joi from 'joi';
// import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
// import { IFine } from '../models/spb.entity';

// @JoiSchemaOptions({
//   allowUnknown: false,
// })
// export class UpdateFineDto implements Partial<Omit<IFine, 'id' | 'created_at' | 'updated_at'>>{
//   @ApiProperty({ example: 'Fine Name' })
//   @JoiSchema(Joi.string().optional())
//   name?: string;;

//   @ApiProperty({ example: 'Type Name' })
//   @JoiSchema(Joi.string().optional())
//   type?: string;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().integer().optional())
//   value?: number;
// }
