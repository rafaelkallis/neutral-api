import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

import { ConfigService, InjectConfig } from 'config';
import { ExpressCookieSessionState } from 'session/express-cookie-session-state';
import { SessionState } from 'session/session-state';

/**
 * Session Middleware.
 *
 * Used to inject the session business object.
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly config: ConfigService;

  public constructor(@InjectConfig() config: ConfigService) {
    this.config = config;
  }

  /**
   * Middleware handle
   */
  public use(
    request: Request & { session?: SessionState },
    response: Response,
    next: () => void,
  ): void {
    if (!request.session) {
      request.session = new ExpressCookieSessionState(
        this.config,
        request,
        response,
      );
    }
    next();
  }
}
