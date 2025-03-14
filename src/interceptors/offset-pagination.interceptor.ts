import { OffsetPagination, OffsetPaginationResponse } from '@app/interfaces/pagination.interface';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OffsetPaginationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<OffsetPagination<Record<string, any>>>,
  ): Observable<OffsetPaginationResponse<Record<string, any>>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map<OffsetPagination<Record<string, any>>, OffsetPaginationResponse<Record<string, any>>>(
        (content) => ({
          meta: {
            total_count: content.totalCount,
            total_page: Math.ceil(
              content.totalCount / (parseInt(request.query.page_size || '10') || 10),
            ),
            page_no: parseInt(request.query.page_no || '1') || 1,
            page_size: parseInt(request.query.page_size || '10') || 10,
          },
          data: content.data,
        }),
      ),
    );
  }
}
