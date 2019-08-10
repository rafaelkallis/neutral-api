import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';

@Injectable()
export class EntityNotFoundInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<void> {
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
