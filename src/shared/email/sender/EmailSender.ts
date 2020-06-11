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
  protected readonly emailSenderAddress: string;
  protected readonly emailSenderName: string;

  protected get emailSender(): string {
    const address = this.emailSenderAddress;
    const name = this.emailSenderName;
    return `${name} <${address}>`;
  }

  public constructor(config: Config) {
    this.emailSenderAddress = config.get('EMAIL_SENDER_ADDRESS');
    this.emailSenderName = config.get('EMAIL_SENDER_NAME');
  }

  /**
   *
   */
  public abstract sendEmail(options: SendEmailOptions): Promise<void>;
}
