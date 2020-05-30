import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { Email } from 'user/domain/value-objects/Email';

/**
 * Token types used throughout the app.
 */
export enum TokenAud {
  LOGIN = 'login_token',
  ACCESS = 'access_token',
  REFRESH = 'refresh_token',
  SESSION = 'session',
  EMAIL_CHANGE = 'email_change_token',
}

export interface BaseToken {
  jti: string;
  aud: TokenAud;
  sub: string;
  iat: number;
  exp: number;
}

/**
 * LoginToken interface.
 */
export interface LoginToken extends BaseToken {
  aud: TokenAud.LOGIN;
  lastLoginAt: number;
}

/**
 * Access token interface.
 */
export interface AccessToken extends BaseToken {
  aud: TokenAud.ACCESS;
}

/**
 * Refresh token interface.
 */
export interface RefreshToken extends BaseToken {
  aud: TokenAud.REFRESH;
}

/**
 * Session token interface.
 */
export interface SessionToken extends BaseToken {
  aud: TokenAud.SESSION;
  maxAge: number;
}

/**
 * Email change token interface.
 */
export interface EmailChangeToken extends BaseToken {
  aud: TokenAud.EMAIL_CHANGE;
  curEmail: string;
  newEmail: string;
}

/**
 * Token Manager
 */
export abstract class TokenManager {
  /**
   * Create a new login token to be used in a login magic link.
   */
  public abstract newLoginToken(email: Email, lastLoginAt: LastLoginAt): string;

  /**
   * Validate and decrypt a login token.
   */
  public abstract validateLoginToken(token: string): LoginToken;

  /**
   * Create a new access token for identifying user sessions.
   */
  public abstract newAccessToken(sub: string): string;

  /**
   * Validate and verify the signature of an access token.
   */
  public abstract validateAccessToken(token: string): AccessToken;

  /**
   * Create a new refresh token for refreshing user sessions.
   */
  public abstract newRefreshToken(sub: string): string;
  /**
   * Validate and the verify the signature of a refresh token.
   */
  public abstract validateRefreshToken(token: string): RefreshToken;

  /**
   * Create a new session token for identifying user sessions.
   */
  public abstract newSessionToken(sub: string, maxAge?: number): string;

  /**
   * Validate and verify the signature of a session token.
   */
  public abstract validateSessionToken(token: string): SessionToken;

  /**
   * Create a new email-change token to be used for verifying
   * a new email address.
   */
  public abstract newEmailChangeToken(
    sub: string,
    curEmail: string,
    newEmail: string,
  ): string;

  /**
   * Validate and decrypt an email-change token.
   */
  public abstract validateEmailChangeToken(token: string): EmailChangeToken;
}
