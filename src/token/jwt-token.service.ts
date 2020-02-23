import { Injectable } from '@nestjs/common';
import { JWE, JWK, JWS } from '@panva/jose';
import moment from 'moment';

import { TokenAudienceIncorrectException } from 'token/exceptions/token-audience-incorrect.exception';
import { TokenClaimMissingException } from 'token/exceptions/token-claim-missing.exception';
import { TokenExpiredException } from 'token/exceptions/token-expired.exception';
import { TokenFromFutureException } from 'token/exceptions/token-from-future.exception';

import { ConfigService, InjectConfig } from 'config';
import {
  TokenService,
  LoginToken,
  TokenAud,
  SignupToken,
  AccessToken,
  RefreshToken,
  SessionToken,
  EmailChangeToken,
  BaseToken,
} from 'token/token.service';
import ObjectID from 'bson-objectid';
import { TokenMalformedException } from 'common/exceptions/token-malformed.exception';
import { Id } from 'common/domain/value-objects/Id';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';

/**
 * Jwt Token Service
 */
@Injectable()
export class JwtTokenService implements TokenService {
  private readonly config: ConfigService;
  private readonly jwk: JWK.Key;

  public constructor(@InjectConfig() config: ConfigService) {
    this.config = config;
    this.jwk = JWK.asKey(this.config.get('SECRET_HEX'));
  }

  /**
   * Create a new login token to be used in a login magic link.
   */
  public newLoginToken(userId: Id, lastLoginAt: LastLoginAt): string {
    const payload: LoginToken = {
      jti: this.createJti(),
      aud: TokenAud.LOGIN,
      sub: userId.value,
      iat: moment().unix(),
      exp: moment()
        .add(this.config.get('LOGIN_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
      lastLoginAt: lastLoginAt.value,
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
      jti: this.createJti(),
      aud: TokenAud.SIGNUP,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.config.get('SIGNUP_TOKEN_LIFETIME_MIN'), 'minutes')
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
      jti: this.createJti(),
      aud: TokenAud.ACCESS,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.config.get('ACCESS_TOKEN_LIFETIME_MIN'), 'minutes')
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
      jti: this.createJti(),
      aud: TokenAud.REFRESH,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.config.get('REFRESH_TOKEN_LIFETIME_MIN'), 'minutes')
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
   * Create a new session token for identifying user sessions.
   */
  public newSessionToken(sub: string, maxAge?: number): string {
    if (!maxAge) {
      maxAge = moment()
        .add(this.config.get('SESSION_MAX_AGE_MIN'), 'minutes')
        .unix();
    }
    const payload: SessionToken = {
      jti: this.createJti(),
      aud: TokenAud.SESSION,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.config.get('SESSION_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
      maxAge,
    };
    return this.sign(payload);
  }

  /**
   * Validate and verify the signature of a session token.
   */
  public validateSessionToken(token: string): SessionToken {
    const payload = this.verify(token);
    if (payload.aud !== TokenAud.SESSION) {
      throw new TokenAudienceIncorrectException();
    }
    if (moment() > moment.unix((payload as SessionToken).maxAge)) {
      /* token has expired */
      throw new TokenExpiredException();
    }
    return payload as SessionToken;
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
      jti: this.createJti(),
      aud: TokenAud.EMAIL_CHANGE,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.config.get('EMAIL_CHANGE_TOKEN_LIFETIME_MIN'), 'minutes')
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
   * Creates a new jti (json token id).
   */
  private createJti(): string {
    return new ObjectID().toHexString();
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
    let payload: BaseToken;
    try {
      payload = JSON.parse(JWE.decrypt(jwe, this.jwk).toString('utf8'));
    } catch (error) {
      throw new TokenMalformedException();
    }
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
