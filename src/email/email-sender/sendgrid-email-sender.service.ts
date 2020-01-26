import { Injectable, HttpService } from '@nestjs/common';
import { Config, InjectConfig } from 'config';
import sendgrid from '@sendgrid/mail';
import {
  EmailSenderService,
  SendEmailOptions,
} from 'email/email-sender/email-sender.service';

/**
 * Sendgrid Email Sender
 */
@Injectable()
export class SendgridEmailSenderService implements EmailSenderService {
  private readonly httpService: HttpService;
  private readonly sendgridApiKey: string;
  private readonly sendgridUrl: string;

  public constructor(@InjectConfig() config: Config, httpService: HttpService) {
    sendgrid.setApiKey(config.get('SENDGRID_API_KEY'));
    this.httpService = httpService;
    this.sendgridApiKey = config.get('SENDGRID_API_KEY');
    this.sendgridUrl = config.get('SENDGRID_URL');
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    const url = this.sendgridUrl + '/v3/mail/send';
    const body = {
      personalizations: [
        {
          to: { email: options.to },
          subject: options.subject,
        },
      ],
      from: {
        email: 'no-reply@covee.network',
        name: 'Covee Network',
      },
      reply_to: {
        email: 'no-reply@covee.network',
        name: 'Covee Network',
      },
      content: [
        { type: 'text/html', value: options.html },
        { type: 'text/plain', value: options.text },
      ],
    };
    const config = {
      headers: {
        Authorization: `Bearer ${this.sendgridApiKey}`,
      },
    };
    await this.httpService.post(url, body, config).toPromise();
  }
}
