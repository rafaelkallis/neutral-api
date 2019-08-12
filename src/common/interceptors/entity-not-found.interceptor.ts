import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';

/**
 * Interceptor for catching typeorm's 'EntityNotFound' error with our errors.
 */
@Injectable()
export class EntityNotFoundInterceptor implements NestInterceptor {
  /**
   * Interceptor handle
   */
  public intercept(_: ExecutionContext, next: CallHandler): Observable<void> {
    return next
      .handle()
      .pipe(
        catchError(error =>
          throwError(
            error.name === 'EntityNotFound'
              ? new EntityNotFoundException()
              : error,
          ),
        ),
      );
  }
}
