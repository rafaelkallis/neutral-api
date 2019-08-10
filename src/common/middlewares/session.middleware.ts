import { Injectable, NestMiddleware } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

import { ConfigService } from '../services/config.service';

export interface ISession {
  set(state: string, lifetimeMin: number): void;
  get(): string;
  clear(): void;
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(
    req: Request & { session: ISession },
    res: Response,
    next: () => void,
  ) {
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
