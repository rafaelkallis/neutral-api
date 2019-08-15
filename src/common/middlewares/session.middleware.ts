import { Injectable, NestMiddleware } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { ConfigService } from '../services/config.service';

/**
 * Session business object for modifying the session state.
 */
export interface SessionState {
  /**
   * Set the session state.
   */
  set(state: string, lifetimeMin: number): void;

  /**
   * Get the session state.
   */
  get(): string;

  /**
   * Clear the session state.
   */
  clear(): void;
}

/**
 * Session Middleware.
 *
 * Used to inject the session business object.
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly configService: ConfigService;
  public constructor(configService: ConfigService) {
    this.configService = configService;
  }

  /**
   * Middleware handle
   */
  public use(
    req: Request & { session: SessionState },
    res: Response,
    next: () => void,
  ): void {
    if (req.session) {
      next();
      return;
    }
    const sessionName = this.configService.get('SESSION_NAME');
    const secure = this.configService.isProduction();
    req.session = {
      set(state, lifetimeMin): void {
        const options: CookieOptions = {
          secure,
          httpOnly: true,
          sameSite: 'strict',
          maxAge: lifetimeMin * 60,
        };
        res.cookie(sessionName, state, options);
      },

      get(): string {
        // eslint-disable-next-line security/detect-object-injection
        return req.cookies[sessionName];
      },

      clear(): void {
        res.clearCookie(sessionName);
      },
    };
    next();
  }
}
