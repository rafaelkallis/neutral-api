import { Injectable } from '@nestjs/common';
import envalid from 'envalid';

interface Config {
  readonly NODE_ENV: string;
  readonly PORT: number;
  readonly FRONTEND_URL: string;
  readonly SECRET_HEX: string;
  readonly DATABASE_URL: string;
  readonly SENDGRID_API_KEY: string;
  readonly LOGIN_TOKEN_LIFETIME_MIN: number;
  readonly SIGNUP_TOKEN_LIFETIME_MIN: number;
  readonly ACCESS_TOKEN_LIFETIME_MIN: number;
  readonly REFRESH_TOKEN_LIFETIME_MIN: number;
  readonly EMAIL_CHANGE_TOKEN_LIFETIME_MIN: number;
  readonly SESSION_NAME: string;
}

/**
 * Config Service
 */
@Injectable()
export class ConfigService {
  private readonly config: Config;

  public constructor() {
    this.config = envalid.cleanEnv<Config>(process.env, {
      NODE_ENV: envalid.str({ choices: ['production', 'test', 'development'] }),
      PORT: envalid.port(),
      FRONTEND_URL: envalid.url(),
      SECRET_HEX: this.strHex64(),
      DATABASE_URL: envalid.url(),
      SENDGRID_API_KEY: envalid.str(),
      LOGIN_TOKEN_LIFETIME_MIN: envalid.num(),
      SIGNUP_TOKEN_LIFETIME_MIN: envalid.num(),
      ACCESS_TOKEN_LIFETIME_MIN: envalid.num(),
      REFRESH_TOKEN_LIFETIME_MIN: envalid.num(),
      EMAIL_CHANGE_TOKEN_LIFETIME_MIN: envalid.num(),
      SESSION_NAME: envalid.str(),
    });
  }

  /**
   * Get a config variable.
   */
  public get<K extends keyof Config>(key: K): Config[K] {
    // eslint-disable-next-line security/detect-object-injection
    return this.config[key];
  }

  /**
   * Returns true if app is running in a production environment.
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Returns true if app is running in a development environment.
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Returns true if app is running in a test environment.
   */
  public isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  private readonly strHex64 = envalid.makeValidator<string>(x => {
    if (/^[0-9a-f]{64}$/.test(x)) {
      return x;
    }
    throw new Error('Expected a hex-character string of length 64');
  });
}
