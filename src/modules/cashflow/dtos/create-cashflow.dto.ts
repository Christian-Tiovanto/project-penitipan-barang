import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { JoiSchema, JoiSchemaOptions } from 'joi-class-decorators';
import { CashflowFrom, ICashflow } from '../models/cashflow.entity';
import { CashflowType } from '@app/enums/cashflow-type';

@JoiSchemaOptions({ allowUnknown: false })
export class CreateCashflowDto
  implements
    Omit<
      ICashflow,
      'id' | 'created_at' | 'updated_at' | 'created_by' | 'total_amount'
    >,
    Partial<Pick<ICashflow, 'created_byId' | 'total_amount' | 'descriptions'>>
{
  @ApiProperty({ example: CashflowType.IN })
  @JoiSchema(
    Joi.string()
      .valid(...Object.values(CashflowType))
      .required(),
  )
  type: CashflowType;

  @ApiProperty({ example: 10000 })
  @JoiSchema(Joi.number().min(1).required())
  amount: number;

  @ApiProperty({ example: 'Cashflow Description' })
  @JoiSchema(Joi.string().trim().optional())
  descriptions?: string;

  from: CashflowFrom;
  created_byId?: number;
  total_amount?: number;
}
