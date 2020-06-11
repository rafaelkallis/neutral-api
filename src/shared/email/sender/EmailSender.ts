import { Config } from 'shared/config/application/Config';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 *
 */
export abstract class EmailSender {
  protected readonly emailSender: string;

  public constructor(config: Config) {
    this.emailSender = config.get('EMAIL_SENDER');
  }

  /**
   *
   */
  public abstract sendEmail(options: SendEmailOptions): Promise<void>;
}
