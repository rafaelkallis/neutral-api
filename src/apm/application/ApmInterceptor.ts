import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  InternalServerErrorException,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApmTransaction, InjectApm, Apm } from 'apm/application/Apm';
import { User } from 'user/domain/User';

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  private readonly apm: Apm;

  public constructor(@InjectApm() apm: Apm) {
    this.apm = apm;
  }
  /**
   * Interceptor handle
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const contextType = context.getType();
    if (contextType !== 'http') {
      throw new InternalServerErrorException();
    }
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<
      Request & { apmTransaction?: ApmTransaction; user: User }
    >();
    const response = httpContext.getResponse<Response>();

    const apmTransaction =
      request.apmTransaction ||
      this.apm.createTransaction(request, response, request.user);
    request.apmTransaction = apmTransaction;
    return next.handle().pipe(
      tap(() => {
        apmTransaction.success();
      }),
      catchError(error => {
        if (!(error instanceof HttpException)) {
          apmTransaction.failure(error);
        } else if (this.isServerError(error)) {
          apmTransaction.failure(error);
        }
        return throwError(error);
      }),
    );
  }

  /**
   *
   */
  private isServerError(error: HttpException): boolean {
    return error.getStatus() >= 500 && error.getStatus() < 600;
  }
}
