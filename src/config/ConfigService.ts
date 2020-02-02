import { Inject } from '@nestjs/common';
import { CONFIG } from 'config/constants';

/**
 *
 */
export function InjectConfig(): ParameterDecorator {
  return Inject(CONFIG);
}

/**
 *
 */
export interface ConfigProps {
  NODE_ENV: string;
  SERVER_NAME: string;
  PORT: number;
  FRONTEND_URL: string;
  SECRET_HEX: string;
  DATABASE_URL: string;
  SMTP_URL: string;
  // SENDGRID_API_KEY: string;
  // SENDGRID_URL: string;
  LOGIN_TOKEN_LIFETIME_MIN: number;
  SIGNUP_TOKEN_LIFETIME_MIN: number;
  ACCESS_TOKEN_LIFETIME_MIN: number;
  SESSION_TOKEN_LIFETIME_MIN: number;
  REFRESH_TOKEN_LIFETIME_MIN: number;
  EMAIL_CHANGE_TOKEN_LIFETIME_MIN: number;
  SESSION_NAME: string;
  SESSION_MAX_AGE_MIN: number;
  ELASTIC_APM_SECRET_TOKEN: string;
  ELASTIC_APM_SERVER_URL: string;
}

/**
 * Config
 */
export abstract class ConfigService {
  /**
   * Get a config variable.
   */
  public abstract get<K extends keyof ConfigProps>(key: K): ConfigProps[K];

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
}
