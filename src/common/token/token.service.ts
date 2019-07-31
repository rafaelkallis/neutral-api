import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { RandomService } from '../random/random.service';
import * as moment from 'moment';
import { JWK, JWS, JWE } from '@panva/jose';
import { TokenClaimMissingException } from './token-claim-missing.exception';
import { TokenExpiredException } from './token-expired.exception';
import { TokenFromFutureException } from './token-from-future.exception';
import { TokenAudienceIncorrectException } from './token-audience-incorrect.exception';

@Injectable()
export class TokenService {
  private jwk = JWK.asKey(this.configService.get('SECRET_HEX'));

  constructor(
    private configService: ConfigService,
    private randomService: RandomService,
  ) {}

  public newLoginToken(sub: string): string {
    const payload: ILoginToken = {
      jti: this.randomService.id(),
      aud: TokenAud.LOGIN,
      sub,
      iat: moment().unix(),
      exp: moment()
        .add(this.configService.get('LOGIN_TOKEN_LIFETIME_MIN'), 'minutes')
        .unix(),
    };
    return this.encrypt(payload);
  }

  public validateLoginToken(token: string): ILoginToken {
    const payload = this.decrypt(token);
    if (payload.aud !== TokenAud.LOGIN) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as ILoginToken;
  }

  public newSignupToken(sub: string): string {
    const payload: ISignupToken = {
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

  public validateSignupToken(token: string): ISignupToken {
    const payload = this.decrypt(token);
    if (payload.aud !== TokenAud.SIGNUP) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as ISignupToken;
  }

  public newAccessToken(sub: string): string {
    const payload: IAccessToken = {
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

  public validateAccessToken(token: string): IAccessToken {
    const payload = this.verify(token);
    if (payload.aud !== TokenAud.ACCESS) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as IAccessToken;
  }

  public newRefreshToken(sub: string): string {
    const payload: IRefreshToken = {
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

  public validateRefreshToken(token: string): IRefreshToken {
    const payload = this.verify(token);
    if (payload.aud !== TokenAud.REFRESH) {
      throw new TokenAudienceIncorrectException();
    }
    return payload as IRefreshToken;
  }

  /**
   * Signs the given payload and returns a JWT.
   *
   * @param payload - The payload to sign.
   * @return A signed json web token.
   */
  private sign(payload: IBaseToken): string {
    return JWS.sign(payload, this.jwk);
  }

  /**
   * Verifies the given JWS and returns the decoded payload.
   * Rejects if  signature is invalid.
   * @param token - The json web token.
   * @return The decoded payload.
   */
  private verify(jwt: string): IBaseToken {
    return JWS.verify(jwt, this.jwk) as IBaseToken;
  }

  /**
   * Encrypts the given payload and returns a JWT.
   * @param payload - The payload to encrypt.
   * @return An encrypted json web token.
   */
  private encrypt(payload: IBaseToken): string {
    return JWE.encrypt(JSON.stringify(payload), this.jwk);
  }

  /**
   * Decrypts the given JWE token  and returns the decrypted
   * payload. Rejects if ciphertext is invalid.
   * @param token - The encrypted json web token.
   * @return The decrypted payload.
   */
  private decrypt(jwe: string): IBaseToken {
    const payload = JSON.parse(
      JWE.decrypt(jwe, this.jwk).toString('utf8'),
    ) as IBaseToken;
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
  private validateBaseToken(payload: IBaseToken): void {
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

/**
 * Token types used throughout the app.
 */
export enum TokenAud {
  LOGIN = 'login_token',
  SIGNUP = 'verify_token',
  ACCESS = 'access_token',
  REFRESH = 'refresh_token',
}

interface IBaseToken {
  jti: string;
  aud: TokenAud;
  sub: string;
  iat: number;
  exp: number;
}

/**
 * LoginToken interface.
 */
export interface ILoginToken extends IBaseToken {
  aud: TokenAud.LOGIN;
}

/**
 * SignupToken interface.
 */
export interface ISignupToken extends IBaseToken {
  aud: TokenAud.SIGNUP;
}

/**
 * Access token interface.
 */
export interface IAccessToken extends IBaseToken {
  aud: TokenAud.ACCESS;
}

/**
 * Refresh token interface.
 */
export interface IRefreshToken extends IBaseToken {
  aud: TokenAud.REFRESH;
}
