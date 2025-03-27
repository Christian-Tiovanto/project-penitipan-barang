// import { ApiProperty } from '@nestjs/swagger';
// import * as Joi from 'joi';
// import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
// import { IInvoice } from '../models/invoice.entity';

// @JoiSchemaOptions({
//   allowUnknown: false,
// })
// export class UpdateInvoiceDto implements Partial<Omit<IInvoice, 'id' | 'created_at' | 'updated_at'>>{
//   @ApiProperty({ example: 'Invoice No' })
//   @JoiSchema(Joi.string().optional())
//   invoice_no?: string;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   total_amount?: number;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   charge?: number;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   fine?: number;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   discount?: number;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   total_order?: number;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   total_order_converted?: number;

//   @ApiProperty({ example: 1000 })
//   @JoiSchema(Joi.number().optional())
//   tax?: number;

//   @ApiProperty({ example: 'status' })
//   @JoiSchema(Joi.string().optional())
//   status?: string;
// }
