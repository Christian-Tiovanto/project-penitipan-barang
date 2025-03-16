import { ValidationException } from '@app/exceptions/validation.exception';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import * as util from 'util';

@Catch()
export class ExceptionHandlerFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    console.error(util.inspect(exception, false, null, true));
    const res = host.switchToHttp().getResponse<Response>();
    const nodeEnv = process.env.NODE_ENV;

    switch (true) {
      case exception instanceof ValidationException:
        res.status(HttpStatus.BAD_REQUEST);
        this.toJson(exception, res);
        break;
      case exception instanceof UnauthorizedException:
        res.status(HttpStatus.UNAUTHORIZED);
        this.toJson(exception, res);
        break;
      case exception instanceof BadRequestException:
        res.status(HttpStatus.BAD_REQUEST);
        this.toJson(exception, res);
        break;
      case exception instanceof ConflictException:
        res.status(HttpStatus.CONFLICT);
        this.toJson(exception, res);
        break;
      case exception instanceof ForbiddenException:
        res.status(HttpStatus.FORBIDDEN);
        this.toJson(exception, res);
        break;
      case exception instanceof NotFoundException:
        res.status(HttpStatus.FORBIDDEN);
        this.toJson(exception, res);
        break;
      // res.status(HttpStatus.SERVICE_UNAVAILABLE);
      // this.toJson(exception, res, 'Service unavailable');
      // break;

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
      message:
        process.env.NODE_ENV === 'production' ? message : exception.message,
    });
  }
}
