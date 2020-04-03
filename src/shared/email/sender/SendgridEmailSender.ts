import { Injectable, NotImplementedException } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { EmailSender, SendEmailOptions } from 'shared/email/sender/EmailSender';
import axios from 'axios';

/**
 * Sendgrid Email Sender
 */
@Injectable()
export class SendgridEmailSender extends EmailSender {
  private readonly sendgridApiKey: string;
  private readonly sendgridUrl: string;

  public constructor(_config: Config) {
    super();
    // this.sendgridApiKey = config.get('SENDGRID_API_KEY');
    // this.sendgridUrl = config.get('SENDGRID_URL');
    this.sendgridApiKey = '';
    this.sendgridUrl = '';
    throw new NotImplementedException();
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    const url = this.sendgridUrl + '/v3/mail/send';
    const body = {
      personalizations: [
        {
          to: [{ email: options.to }],
          subject: options.subject,
        },
      ],
      from: {
        // TODO set to no-reply@covee.network
        email: 'no-reply@example.com',
        name: 'Covee Network',
      },
      content: [
        { type: 'text/plain', value: options.text },
        { type: 'text/html', value: options.html },
      ],
    };
    const config = {
      headers: {
        Authorization: `Bearer ${this.sendgridApiKey}`,
        Accept: 'application/json',
      },
    };
    await axios.post(url, body, config);
  }
}
