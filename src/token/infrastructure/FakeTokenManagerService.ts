import { Injectable } from '@nestjs/common';

import {
  TokenManager,
  LoginToken,
  TokenAud,
  SignupToken,
  AccessToken,
  RefreshToken,
  SessionToken,
  EmailChangeToken,
} from 'token/application/TokenManager';
import { Id } from 'common/domain/value-objects/Id';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';

/**
 * Fake Token Manager Service
 */
@Injectable()
export class FakeTokenManagerService implements TokenManager {
  /**
   * Create a new login token to be used in a login magic link.
   */
  public newLoginToken(userId: Id, lastLoginAt: LastLoginAt): string {
    const payload: LoginToken = {
      jti: '',
      aud: TokenAud.LOGIN,
      sub: userId.value,
      iat: 0,
      exp: 0,
      lastLoginAt: lastLoginAt.value,
    };
    return JSON.stringify(payload);
  }

  /**
   * Validate and decrypt a login token.
   */
  public validateLoginToken(token: string): LoginToken {
    return JSON.parse(token);
  }

  /**
   * Create a new signup token to be used in a signup magic link.
   */
  public newSignupToken(sub: string): string {
    const payload: SignupToken = {
      jti: '',
      aud: TokenAud.SIGNUP,
      sub,
      iat: 0,
      exp: 0,
    };
    return JSON.stringify(payload);
  }

  /**
   * Validate and decrypt a signup token.
   */
  public validateSignupToken(token: string): SignupToken {
    return JSON.parse(token);
  }

  /**
   * Create a new access token for identifying user sessions.
   */
  public newAccessToken(sub: string): string {
    const payload: AccessToken = {
      jti: '',
      aud: TokenAud.ACCESS,
      sub,
      iat: 0,
      exp: 0,
    };
    return JSON.stringify(payload);
  }

  /**
   * Validate and verify the signature of an access token.
   */
  public validateAccessToken(token: string): AccessToken {
    return JSON.parse(token);
  }

  /**
   * Create a new refresh token for refreshing user sessions.
   */
  public newRefreshToken(sub: string): string {
    const payload: RefreshToken = {
      jti: '',
      aud: TokenAud.REFRESH,
      sub,
      iat: 0,
      exp: 0,
    };
    return JSON.stringify(payload);
  }

  /**
   * Validate and the verify the signature of a refresh token.
   */
  public validateRefreshToken(token: string): RefreshToken {
    return JSON.parse(token);
  }

  /**
   * Create a new session token for identifying user sessions.
   */
  public newSessionToken(sub: string, maxAge = 0): string {
    const payload: SessionToken = {
      jti: '',
      aud: TokenAud.SESSION,
      sub,
      iat: 0,
      exp: 0,
      maxAge,
    };
    return JSON.stringify(payload);
  }

  /**
   * Validate and verify the signature of a session token.
   */
  public validateSessionToken(token: string): SessionToken {
    return JSON.parse(token);
  }

  /**
   * Create a new email-change token to be used for verifying
   * a new email address.
   */
  public newEmailChangeToken(
    sub: string,
    curEmail: string,
    newEmail: string,
  ): string {
    const payload: EmailChangeToken = {
      jti: '',
      aud: TokenAud.EMAIL_CHANGE,
      sub,
      iat: 0,
      exp: 0,
      curEmail,
      newEmail,
    };
    return JSON.stringify(payload);
  }

  /**
   * Validate and decrypt an email-change token.
   */
  public validateEmailChangeToken(token: string): EmailChangeToken {
    return JSON.parse(token);
  }
}
