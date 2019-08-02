import { Injectable } from '@nestjs/common';
import { getHashes } from 'crypto';
import * as envalid from 'envalid';

interface IConfig {
  readonly NODE_ENV: string;
  readonly PORT: number;
  readonly FRONTEND_URL: string;
  readonly SECRET_HEX: string;
  readonly DATABASE_URL: string;
  readonly SENDGRID_API_KEY: string;
  readonly LOGIN_TOKEN_LIFETIME_MIN: number;
  readonly SIGNUP_TOKEN_LIFETIME_MIN: number;
  readonly ACCESS_TOKEN_LIFETIME_MIN: number;
  readonly ACCESS_TOKEN_COOKIE_NAME: string;
  readonly REFRESH_TOKEN_LIFETIME_MIN: number;
  readonly EMAIL_CHANGE_TOKEN_LIFETIME_MIN: number;
}

@Injectable()
export class ConfigService {
  private config: IConfig;

  constructor() {
    this.config = envalid.cleanEnv<IConfig>(process.env, {
      NODE_ENV: envalid.str({ choices: ['production', 'test', 'development'] }),
      PORT: envalid.port(),
      FRONTEND_URL: envalid.url(),
      SECRET_HEX: strHex64(),
      DATABASE_URL: envalid.url(),
      SENDGRID_API_KEY: envalid.str(),
      LOGIN_TOKEN_LIFETIME_MIN: envalid.num(),
      SIGNUP_TOKEN_LIFETIME_MIN: envalid.num(),
      ACCESS_TOKEN_LIFETIME_MIN: envalid.num(),
      ACCESS_TOKEN_COOKIE_NAME: envalid.str(),
      REFRESH_TOKEN_LIFETIME_MIN: envalid.num(),
      EMAIL_CHANGE_TOKEN_LIFETIME_MIN: envalid.num(),
    });
  }

  get<K extends keyof IConfig>(key: K): IConfig[K] {
    return this.config[key];
  }

  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  isTest() {
    return this.get('NODE_ENV') === 'test';
  }
}

const strHex64 = envalid.makeValidator<string>(x => {
  if (/^[0-9a-f]{64}$/.test(x)) {
    return x;
  }
  throw new Error('Expected a hex-character string of length 64');
});
