import { Injectable } from '@nestjs/common';
import envalid from 'envalid';
import { Config, ConfigProps } from 'config/config';

/**
 * Envalid Config Service
 */
@Injectable()
export class EnvalidConfig extends Config {
  private readonly config: ConfigProps;

  public constructor() {
    super();
    this.config = this.createAndValidateConfig();
  }

  private createAndValidateConfig(): ConfigProps {
    return envalid.cleanEnv<ConfigProps>(process.env, {
      NODE_ENV: envalid.str({ choices: ['production', 'test', 'development'] }),
      PORT: envalid.port(),
      FRONTEND_URL: envalid.url(),
      SECRET_HEX: this.strHex64(),
      DATABASE_URL: envalid.url(),
      SENDGRID_API_KEY: envalid.str(),
      SENDGRID_URL: envalid.url(),
      LOGIN_TOKEN_LIFETIME_MIN: envalid.num(),
      SIGNUP_TOKEN_LIFETIME_MIN: envalid.num(),
      ACCESS_TOKEN_LIFETIME_MIN: envalid.num(),
      REFRESH_TOKEN_LIFETIME_MIN: envalid.num(),
      SESSION_TOKEN_LIFETIME_MIN: envalid.num(),
      EMAIL_CHANGE_TOKEN_LIFETIME_MIN: envalid.num(),
      SESSION_NAME: envalid.str(),
      SESSION_MAX_AGE_MIN: envalid.num(),
    });
  }

  /**
   * Get a config variable.
   */
  public get<K extends keyof ConfigProps>(key: K): ConfigProps[K] {
    return this.config[key];
  }

  private readonly strHex64 = envalid.makeValidator<string>(x => {
    if (/^[0-9a-f]{64}$/.test(x)) {
      return x;
    }
    throw new Error('Expected a hex-character string of length 64');
  });
}
