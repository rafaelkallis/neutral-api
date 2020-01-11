import { Config } from 'config';
import { SessionState } from 'session/session-state';
import { Request, Response, CookieOptions } from 'express';
import { InternalServerErrorException } from '@nestjs/common';

/**
 *
 */
export class ExpressCookieSessionState implements SessionState {
  private readonly config: Config;
  private readonly request: Request;
  private readonly response: Response;

  public constructor(config: Config, request: Request, response: Response) {
    this.config = config;
    this.request = request;
    this.response = response;
  }

  /**
   *
   */
  public exists(): boolean {
    return Boolean(this.request.cookies[this.getSessionHeaderName()]);
  }

  /**
   *
   */
  public get(): string {
    const session = this.request.cookies[this.getSessionHeaderName()];
    if (!session) {
      throw new InternalServerErrorException('no session cookie found');
    }
    return session;
  }

  /**
   *
   */
  public set(state: string): void {
    const secure = this.config.isProduction();
    const options: CookieOptions = {
      secure,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.getSessionTokenLifetimeMin() * 60,
    };
    this.response.cookie(this.getSessionHeaderName(), state, options);
  }

  /**
   *
   */
  public clear(): void {
    this.response.clearCookie(this.getSessionHeaderName());
  }

  private getSessionHeaderName(): string {
    return this.config.get('SESSION_NAME');
  }

  private getSessionTokenLifetimeMin(): number {
    return this.config.get('SESSION_TOKEN_LIFETIME_MIN');
  }
}
