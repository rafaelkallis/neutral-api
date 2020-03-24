import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  InternalServerErrorException,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { TelemetryClient } from 'telemetry/application/TelemetryClient';
import { User } from 'user/domain/User';

@Injectable()
export class TelemetryInterceptor implements NestInterceptor {
  private readonly telemetryClient: TelemetryClient;

  public constructor(telemetryClient: TelemetryClient) {
    this.telemetryClient = telemetryClient;
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
    const request = httpContext.getRequest<Request & { user?: User }>();
    const response = httpContext.getResponse<Response>();

    this.telemetryClient.setTransaction(request, response, request.user);
    return next.handle().pipe(
      catchError((error) => {
        if (!(error instanceof HttpException)) {
          this.telemetryClient.error(error);
        } else if (this.isServerError(error)) {
          this.telemetryClient.error(error);
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
