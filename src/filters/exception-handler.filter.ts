import { JsonApiValidationError } from '@app/interfaces/json-api.interface';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import Joi, { ValidationError, ValidationErrorItem } from 'joi';
import * as util from 'util';

@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    console.error(util.inspect(exception, false, null, true));
    const res = host.switchToHttp().getResponse<Response>();
    const nodeEnv = process.env.NODE_ENV;

    switch (true) {
      case Joi.isError(exception):
        res.status(HttpStatus.BAD_REQUEST);
        this.toJsonApiSchema(exception as ValidationError, res);
        break;
      // case exception instanceof BaseValidationException:
      //   res.status(HttpStatus.BAD_REQUEST);
      //   res.json({ errors: (exception as any).errors });
      //   break;

        res.status(HttpStatus.SERVICE_UNAVAILABLE);
        this.toJson(exception, res, 'Service unavailable');
        break;

      default:
        if (nodeEnv === 'production') {
          // getRollbarInstance().error(exception);
        }

        if (!(exception instanceof InternalServerErrorException)) {
          exception = new InternalServerErrorException(exception.message);
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR);
        this.toJson(exception, res, 'Internal server error');
    }
  }

  private toJson(exception: Error, res: Response, message?: string): void {
    res.json({
      name: exception.constructor.name || 'Error',
      message: exception.message,
      // message: process.env.NODE_ENV === 'production' ? message : exception.message,
    });
  }

  private toJsonApiSchema(err: ValidationError, res: Response): void {
    const errorDetails = err.details as ValidationErrorItem[];

    if (errorDetails && Array.isArray(errorDetails)) {
      const errors: JsonApiValidationError[] = [];

      errorDetails.forEach((detail: ValidationErrorItem): void => {
        /**
         * Serialize regex to string before
         * serializing validation errors to json.
         */
        for (const contextKey in detail.context) {
          if (detail.context[contextKey] instanceof RegExp) {
            detail.context[contextKey] = detail.context[contextKey].source;
          }
        }

        errors.push({
          status: HttpStatus.BAD_REQUEST.toString(),
          source: detail.path.join('/'),
          title: detail.message,
          detail: {
            type: detail.type,
            context: detail.context,
          },
        });
      });

      res.status(400).json({ errors });
    }
  }
}
