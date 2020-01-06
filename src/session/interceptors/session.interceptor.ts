import {
  ExecutionContext,
  Injectable,
  Inject,
  NestInterceptor,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Config, CONFIG } from 'config';
import { SessionState } from 'session/session-state';
import { ExpressCookieSessionState } from 'session/express-cookie-session-state';
import { Observable } from 'rxjs';

/**
 * Auth Guard.
 *
 * Retrieves the session state either from cookies or the authorization header.
 */
@Injectable()
export class SessionInterceptor implements NestInterceptor {
  private readonly config: Config;

  public constructor(@Inject(CONFIG) config: Config) {
    this.config = config;
  }

  /**
   * Interceptor handle
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<void> {
    const contextType = context.getType<string>();
    if (contextType !== 'express') {
      throw new InternalServerErrorException(
        `expected "express" context type, but got: ${contextType}`,
      );
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { session?: SessionState }>();
    const response = context.switchToHttp().getResponse<Response>();

    if (!request.session) {
      request.session = new ExpressCookieSessionState(
        this.config,
        request,
        response,
      );
    }
    return next.handle();
  }
}
