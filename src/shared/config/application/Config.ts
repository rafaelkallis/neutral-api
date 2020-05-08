/**
 *
 */
export interface ConfigProps {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  SERVER_URL: string;
  SECRET_HEX: string;
  DATABASE_URL: string;
  SMTP_URL: string;
  EMAIL_SENDER: string;
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
  AZURE_MONITOR_INSTRUMENTATION_KEY: string;
  AZURE_BLOB_STORAGE_CONNECTION_STRING: string;
  AMQP_CONNECTION: string;
}

/**
 * Config
 */
export abstract class Config {
  /**
   * Get a config variable.
   */
  public abstract get<K extends keyof ConfigProps>(key: K): ConfigProps[K];
}
