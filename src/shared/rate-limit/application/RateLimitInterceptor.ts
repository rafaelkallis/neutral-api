import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  InternalServerErrorException,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { RateLimitBackend } from './RateLimitBackend';
import { Reflector } from '@nestjs/core';

export enum RateLimitMetadata {
  RESOURCE_KEY = 'rate_limit_resource_key',
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly reflector: Reflector;
  private readonly rateLimitBackend: RateLimitBackend;

  public constructor(reflector: Reflector, rateLimitBackend: RateLimitBackend) {
    this.reflector = reflector;
    this.rateLimitBackend = rateLimitBackend;
  }

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const contextType = context.getType();
    if (contextType !== 'http') {
      throw new InternalServerErrorException();
    }
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const resourceKey: string | undefined = this.reflector.get(
      RateLimitMetadata.RESOURCE_KEY,
      context.getHandler(),
    );

    const consumeResult = await this.rateLimitBackend.consume(
      resourceKey || 'default',
      request.ip,
    );

    response.set('Retry-After', consumeResult.retryAfterSeconds.toFixed(0));
    response.set('X-RateLimit-Limit', consumeResult.totalRequests.toFixed(0));
    response.set(
      'X-RateLimit-Remaining',
      consumeResult.remainingRequests.toFixed(0),
    );
    response.set(
      'X-RateLimit-Reset',
      consumeResult.retryAfterSeconds.toFixed(0),
    );

    if (!consumeResult.success) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
