import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { Config, CONFIG } from 'config';

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
   * Returns true if session state exists.
   */
  exists(): boolean;

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
  private readonly config: Config;
  public constructor(@Inject(CONFIG) config: Config) {
    this.config = config;
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
    const sessionName = this.config.get('SESSION_NAME');
    const secure = this.config.isProduction();
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
        const state = req.cookies[sessionName];
        if (!state) {
          throw new Error();
        }
        return state;
      },

      exists(): boolean {
        // eslint-disable-next-line security/detect-object-injection
        return Boolean(req.cookies[sessionName]);
      },

      clear(): void {
        res.clearCookie(sessionName);
      },
    };
    next();
  }
}
