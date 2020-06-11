import { Injectable } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { EmailSender, SendEmailOptions } from 'shared/email/sender/EmailSender';
import Mailjet from 'node-mailjet';

@Injectable()
export class MailjetEmailSender extends EmailSender {
  private readonly client: Mailjet.Email.Client;

  public constructor(config: Config) {
    super(config);
    const apiPublicKey = config.get('MAILJET_API_PUBLIC_KEY');
    const apiSecretKey = config.get('MAILJET_API_SECRET_KEY');
    this.client = Mailjet.connect(apiPublicKey, apiSecretKey);
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    // https://dev.mailjet.com/email/guides/send-api-v31/
    // https://github.com/mailjet/mailjet-apiv3-nodejs#make-your-first-call
    await this.client.post('send', { version: '3.1' }).request({
      Globals: {
        From: { Email: super.emailSender },
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
  }
}
