import { Injectable } from '@nestjs/common';
import { Config, ConfigProps } from 'config/application/Config';

/**
 * Mock Config
 */
@Injectable()
export class MockConfigService extends Config {
  private readonly configProps: ConfigProps;

  public constructor() {
    super();
    this.configProps = this.createMockConfigProps();
  }

  /**
   * Get a config variable.
   */
  public get<K extends keyof ConfigProps>(key: K): ConfigProps[K] {
    return this.configProps[key];
  }

  /**
   * Set a config variable.
   */
  public set<K extends keyof ConfigProps>(key: K, value: ConfigProps[K]): void {
    this.configProps[key] = value;
  }

  private createMockConfigProps(): ConfigProps {
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: -1,
      FRONTEND_URL: '',
      SERVER_URL: '',
      SECRET_HEX: '',
      DATABASE_URL: '',
      SMTP_URL: '',
      // SENDGRID_API_KEY: '',
      // SENDGRID_URL: '',
      LOGIN_TOKEN_LIFETIME_MIN: 0,
      SIGNUP_TOKEN_LIFETIME_MIN: 0,
      ACCESS_TOKEN_LIFETIME_MIN: 0,
      SESSION_TOKEN_LIFETIME_MIN: 0,
      REFRESH_TOKEN_LIFETIME_MIN: 0,
      EMAIL_CHANGE_TOKEN_LIFETIME_MIN: 0,
      SESSION_NAME: '',
      SESSION_MAX_AGE_MIN: 0,
      // ELASTIC_APM_SERVICE_NAME: '',
      // ELASTIC_APM_SECRET_TOKEN: '',
      // ELASTIC_APM_SERVER_URL: '',
      AZURE_MONITOR_INSTRUMENTATION_KEY: '',
      AZURE_BLOB_STORAGE_CONNECTION_STRING: '',
    };
  }
}
