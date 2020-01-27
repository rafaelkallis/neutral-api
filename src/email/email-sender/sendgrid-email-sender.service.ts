import {
  Injectable,
  HttpService,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService, InjectConfig } from 'config';
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

  public constructor(
    @InjectConfig() config: ConfigService,
    httpService: HttpService,
  ) {
    this.httpService = httpService;
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
    await this.httpService.post(url, body, config).toPromise();
  }
}
