import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class MetaDataInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: T) => {
        const meta = {
          status: 'success',
          timestamp: new Date().toISOString(),
          //   resultCount: Array.isArray(data) ? data.length : 1,
        };
        return { meta, data };
      }),
    );
  }
}
