import { Injectable } from '@nestjs/common';
import { JWE, JWK, JWS } from '@panva/jose';
import moment from 'moment';

import { TokenAudienceIncorrectException } from '../exceptions/token-audience-incorrect.exception';
import { TokenClaimMissingException } from '../exceptions/token-claim-missing.exception';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { TokenFromFutureException } from '../exceptions/token-from-future.exception';

import { ConfigService } from './config.service';
import { RandomService } from './random.service';

/**
 * Token types used throughout the app.
 */
export enum TokenAud {
  LOGIN = 'login_token',
  SIGNUP = 'signup_token',
  ACCESS = 'access_token',
  REFRESH = 'refresh_token',
  EMAIL_CHANGE = 'email_change_token',
}

interface BaseToken {
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
 * SignupToken interface.
 */
export interface SignupToken extends BaseToken {
  aud: TokenAud.SIGNUP;
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
 * Email change token interface.
 */
export interface EmailChangeToken extends BaseToken {
  aud: TokenAud.EMAIL_CHANGE;
  curEmail: string;
  newEmail: string;
}

/**
 * Token Service
 */
@Injectable()
export class TokenService {
  private readonly configService: ConfigService;
  private readonly randomService: RandomService;
  private readonly jwk: JWK.Key;

  public constructor(
    configService: ConfigService,
    randomService: RandomService,
  ) {
    this.configService = configService;
    this.randomService = randomService;
    this.jwk = JWK.asKey(this.configService.get('SECRET_HEX'));
  }

  /**
   * Create a new login token to be used in a login magic link.
   */
  public newLoginToken(userId: string, lastLoginAt: number): string {
    const payload: LoginToken = {
      jti: this.randomService.id(),
      aud: TokenAud.LOGIN,
      sub: userId,
      iat: moment().unix(),
      exp: moment()
        .add(this.configService.get('LOGIN_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
      lastLoginAt,
    };
    return this.encrypt(payload);
  }

  /**
   * Validate and decrypt a login token.
   */
  public validateLoginToken(token: string): LoginToken {
    const payload = this.decrypt(token);
    if (payload.aud !== TokenAud.LOGIN) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as LoginToken;
  }

  /**
   * Create a new signup token to be used in a signup magic link.
   */
  public newSignupToken(sub: string): string {
    const payload: SignupToken = {
      jti: this.randomService.id(),
      aud: TokenAud.SIGNUP,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.configService.get('SIGNUP_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
    };
    return this.encrypt(payload);
  }

  /**
   * Validate and decrypt a signup token.
   */
  public validateSignupToken(token: string): SignupToken {
    const payload = this.decrypt(token);
    if (payload.aud !== TokenAud.SIGNUP) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as SignupToken;
  }

  /**
   * Create a new access token for identifying user sessions.
   */
  public newAccessToken(sub: string): string {
    const payload: AccessToken = {
      jti: this.randomService.id(),
      aud: TokenAud.ACCESS,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.configService.get('ACCESS_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
    };
    return this.sign(payload);
  }

  /**
   * Validate and verify the signature of an access token.
   */
  public validateAccessToken(token: string): AccessToken {
    const payload = this.verify(token);
    if (payload.aud !== TokenAud.ACCESS) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as AccessToken;
  }

  /**
   * Create a new refresh token for refreshing user sessions.
   */
  public newRefreshToken(sub: string): string {
    const payload: RefreshToken = {
      jti: this.randomService.id(),
      aud: TokenAud.REFRESH,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.configService.get('REFRESH_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
    };
    return this.sign(payload);
  }

  /**
   * Validate and the verify the signature of a refresh token.
   */
  public validateRefreshToken(token: string): RefreshToken {
    const payload = this.verify(token);
    if (payload.aud !== TokenAud.REFRESH) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as RefreshToken;
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
      jti: this.randomService.id(),
      aud: TokenAud.EMAIL_CHANGE,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(
          this.configService.get('EMAIL_CHANGE_TOKEN_LIFETIME_MIN'),
          'minutes',
        )
        .unix(),
      curEmail,
      newEmail,
    };
    return this.encrypt(payload);
  }

  /**
   * Validate and decrypt an email-change token.
   */
  public validateEmailChangeToken(token: string): EmailChangeToken {
    const payload = this.decrypt(token);
    if (payload.aud !== TokenAud.EMAIL_CHANGE) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as EmailChangeToken;
  }

  /**
   * Signs the given payload and returns a JWT.
   *
   * @param payload - The payload to sign.
   * @return A signed json web token.
   */
  private sign(payload: BaseToken): string {
    return JWS.sign(payload, this.jwk);
  }

  /**
   * Verifies the given JWS and returns the decoded payload.
   * Rejects if  signature is invalid.
   * @param token - The json web token.
   * @return The decoded payload.
   */
  private verify(jwt: string): BaseToken {
    return JWS.verify(jwt, this.jwk) as BaseToken;
  }

  /**
   * Encrypts the given payload and returns a JWT.
   * @param payload - The payload to encrypt.
   * @return An encrypted json web token.
   */
  private encrypt(payload: BaseToken): string {
    return JWE.encrypt(JSON.stringify(payload), this.jwk);
  }

  /**
   * Decrypts the given JWE token  and returns the decrypted
   * payload. Rejects if ciphertext is invalid.
   * @param token - The encrypted json web token.
   * @return The decrypted payload.
   */
  private decrypt(jwe: string): BaseToken {
    const payload = JSON.parse(
      JWE.decrypt(jwe, this.jwk).toString('utf8'),
    ) as BaseToken;
    this.validateBaseToken(payload);
    return payload;
  }

  /**
   * Determines if the given JWT token has valid timestamps, i.e.
   * the "exp" claim is not younger than the present instance of time and
   * the "iat" claim is not older than the present instance of time.
   *
   * More information regarding the claims can be found on
   * {@link https://tools.ietf.org/html/rfc7519}
   * under sections 4.1.3 and 4.1.4.
   *
   * @param payload The token's payload.
   * @return True if the token is not expired.
   */
  private validateBaseToken(payload: BaseToken): void {
    const { iat, exp } = payload;
    if (!iat) {
      /* a claim is missing */
      throw new TokenClaimMissingException();
    }
    if (moment() < moment.unix(iat)) {
      /* token was issued in the future */
      throw new TokenFromFutureException();
    }
    if (!exp) {
      /* a claim is missing */
      throw new TokenClaimMissingException();
    }
    if (moment() > moment.unix(exp)) {
      /* token has expired */
      throw new TokenExpiredException();
    }
  }
}
