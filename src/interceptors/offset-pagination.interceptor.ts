import {
  BasePaginationQuery,
  OffsetPagination,
  OffsetPaginationResponse,
} from '@app/interfaces/pagination.interface';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OffsetPaginationInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<OffsetPagination<T>>,
  ): Observable<OffsetPaginationResponse<T>> {
    const request: Request<any, any, any, BasePaginationQuery> = context
      .switchToHttp()
      .getRequest();
    return next.handle().pipe(
      map<OffsetPagination<T>, OffsetPaginationResponse<T>>((content) => ({
        meta: {
          total_count: content.totalCount,
          total_page: Math.ceil(
            content.totalCount / (parseInt(request.query.page_size) || 10),
          ),
          page_no: parseInt(request.query.page_no) || 1,
          page_size: parseInt(request.query.page_size) || 10,
        },
        data: content.data,
      })),
    );
  }
}
