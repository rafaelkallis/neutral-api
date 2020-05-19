import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

import { Config } from 'shared/config/application/Config';
import { ExpressCookieSessionState } from 'shared/session/express-cookie-session-state';
import { SessionState } from 'shared/session/session-state';
import { Environment } from 'shared/utility/application/Environment';

/**
 * Session Middleware.
 *
 * Used to inject the session business object.
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly environment: Environment;
  private readonly config: Config;

  public constructor(environment: Environment, config: Config) {
    this.environment = environment;
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
        this.environment,
        this.config,
        request,
        response,
      );
    }
    next();
  }
}
