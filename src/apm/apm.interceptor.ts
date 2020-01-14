import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  InternalServerErrorException,
  CallHandler,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';
import { APM_SERVICE } from 'apm/constants';
import { ApmService } from 'apm/apm.service';
import { UserEntity } from 'user';

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  private readonly apm: ApmService;

  public constructor(@Inject(APM_SERVICE) apm: ApmService) {
    this.apm = apm;
  }

  /**
   *
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const contextType = context.getType();
    if (contextType !== 'http') {
      throw new InternalServerErrorException();
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserEntity }>();
    // console.log(context.getClass().name, context.getHandler().name);
    const apmTransaction = this.apm.createTransaction(request, request.user);

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
