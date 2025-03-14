import { ValidationErrorType } from '@app/enums/validation-error-type';
import { BaseConflictException } from '@app/exceptions/base-validation.exception';
import { JsonApiConflictError } from '@app/interfaces/json-api.interface';
import { HttpStatus } from '@nestjs/common';

export class DuplicateNameException extends BaseConflictException {
  public errors!: JsonApiConflictError[];

  constructor(message: string, key: string, value: any) {
    super(message);
    this.errors = [
      {
        status: HttpStatus.CONFLICT.toString(),
        source: key,
        title: message,
        detail: {
          type: ValidationErrorType.DUPLICATE_NAME,
          context: { key, value, label: key },
        },
      },
    ];
  }
}
