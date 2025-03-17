import { ValidationException } from '@app/exceptions/validation.exception';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { getClassSchema } from 'joi-class-decorators';

@Injectable()
export class DataValidationPipe implements PipeTransform {
  constructor() {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' || metadata.type === 'custom') return value;
    const validated = getClassSchema(metadata.metatype).validate(value);
    if (validated.error) {
      throw new ValidationException(validated.error.details[0].message);
    }
    return value;
  }
}
