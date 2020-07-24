import { Injectable } from '@nestjs/common';
import envalid from 'envalid';
import { Config, ConfigProps } from 'shared/config/application/Config';

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
      PORT: envalid.port({ devDefault: 4000 }),
      FRONTEND_URL: envalid.url({ devDefault: 'http://127.0.0.1:3000' }),
      SERVER_URL: envalid.url({ devDefault: 'http://127.0.0.1:4000' }),
      SECRET_HEX: this.strHex64({
        devDefault:
          '0000000000000000000000000000000000000000000000000000000000000000',
      }),
      DATABASE_URL: envalid.url({
        devDefault: 'postgres://covee-saas:password@127.0.0.1:5432/covee-saas',
      }),
      SMTP_URL: envalid.url({ devDefault: 'smtp://127.0.0.1:1025' }),
      EMAIL_SENDER_ADDRESS: envalid.str({ devDefault: 'welcome@covee.local' }),
      EMAIL_SENDER_NAME: envalid.str({ devDefault: 'Covee Network Local' }),
      SENDGRID_API_KEY: envalid.str({ devDefault: '' }),
      LOGIN_TOKEN_LIFETIME_MIN: envalid.num({ devDefault: 10 }),
      SIGNUP_TOKEN_LIFETIME_MIN: envalid.num({ devDefault: 20 }),
      ACCESS_TOKEN_LIFETIME_MIN: envalid.num({ devDefault: 60 * 24 * 365 }),
      REFRESH_TOKEN_LIFETIME_MIN: envalid.num({ devDefault: 7200 }),
      SESSION_TOKEN_LIFETIME_MIN: envalid.num({ devDefault: 60 * 24 * 7 }),
      EMAIL_CHANGE_TOKEN_LIFETIME_MIN: envalid.num({ devDefault: 20 }),
      SESSION_NAME: envalid.str({ devDefault: 'id' }),
      SESSION_MAX_AGE_MIN: envalid.num({ devDefault: 60 * 24 * 365 }),
      // ELASTIC_APM_SERVICE_NAME: envalid.str({ devDefault: 'covee-saas-api' }),
      // ELASTIC_APM_SECRET_TOKEN: envalid.str({ devDefault: '' }),
      // ELASTIC_APM_SERVER_URL: envalid.url({
      //   devDefault: 'http://127.0.0.1:8200',
      // }),
      AZURE_MONITOR_INSTRUMENTATION_KEY: envalid.str({
        devDefault: '12629b1b-253b-4e15-acf3-7ba31f8bceb4',
      }),
      AZURE_BLOB_STORAGE_CONNECTION_STRING: envalid.str({
        devDefault:
          'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;',
      }),
      AMQP_CONNECTION: envalid.str({
        devDefault: 'amqp://covee-saas:password@127.0.0.1:5672',
      }),
      MAILJET_API_PUBLIC_KEY: envalid.str({ devDefault: '' }),
      MAILJET_API_SECRET_KEY: envalid.str({ devDefault: '' }),
    });
  }

  /**
   * Get a config variable.
   */
  public get<K extends keyof ConfigProps>(key: K): ConfigProps[K] {
    return this.config[key];
  }

  private readonly strHex64 = envalid.makeValidator<string>((x) => {
    if (/^[0-9a-f]{64}$/.test(x)) {
      return x;
    }
    throw new Error('Expected a hex-character string of length 64');
  });
}
