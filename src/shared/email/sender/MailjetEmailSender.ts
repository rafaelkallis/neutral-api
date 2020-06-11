import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { EmailSender, SendEmailOptions } from 'shared/email/sender/EmailSender';
import Mailjet from 'node-mailjet';

@Injectable()
export class MailjetEmailSender extends EmailSender {
  private readonly logger: Logger;
  private readonly client: Mailjet.Email.Client;

  public constructor(config: Config) {
    super(config);
    this.logger = new Logger(MailjetEmailSender.name);
    const apiPublicKey = config.get('MAILJET_API_PUBLIC_KEY');
    const apiSecretKey = config.get('MAILJET_API_SECRET_KEY');
    this.client = Mailjet.connect(apiPublicKey, apiSecretKey);
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    // https://dev.mailjet.com/email/guides/send-api-v31/
    // https://github.com/mailjet/mailjet-apiv3-nodejs#make-your-first-call
    const promise = this.client.post('send', { version: 'v3.1' }).request({
      Globals: {
        From: {
          Email: this.emailSenderAddress,
          Name: this.emailSenderName,
        },
        Subject: options.subject,
        TextPart: options.text,
        HTMLPart: options.html,
      },
      Messages: [
        {
          To: [{ Email: options.to /* , Name: "" */ }],
        },
      ],
    });

    try {
      await promise;
    } catch (error) {
      if (!(error instanceof Error)) {
        return;
      }
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error, 'Mailjet failure.');
    }
  }
}
