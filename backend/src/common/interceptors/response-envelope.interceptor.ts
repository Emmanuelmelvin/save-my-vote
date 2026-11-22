import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export interface SuccessBody<T> {
  status: 'success';
  data: T;
}

/** Wraps every successful handler result as `{ status: 'success', data }`. */
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  SuccessBody<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessBody<T>> {
    return next.handle().pipe(
      map((data) => ({
        status: 'success' as const,
        data: data ?? (null as T),
      })),
    );
  }
}
