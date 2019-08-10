import { Injectable, NestMiddleware } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { ConfigService } from '../services/config.service';

/**
 * Session business object for modifying the session state.
 */
export interface ISession {
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
  constructor(private configService: ConfigService) {}

  /**
   * Middleware handle
   */
  use(req: Request & { session: ISession }, res: Response, next: () => void) {
    if (req.session) {
      return next();
    }
    const sessionName = this.configService.get('SESSION_NAME');
    const secure = this.configService.isProduction();
    req.session = {
      set: (state, lifetimeMin) => {
        const options: CookieOptions = {
          secure,
          httpOnly: true,
          sameSite: 'strict',
          maxAge: lifetimeMin * 60,
        };
        res.cookie(sessionName, state, options);
      },

      get: () => {
        return req.cookies[sessionName];
      },

      clear: () => {
        res.clearCookie(sessionName);
      },
    };
    next();
  }
}
