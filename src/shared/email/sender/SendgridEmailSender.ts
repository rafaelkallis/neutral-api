import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { EmailSender, SendEmailOptions } from 'shared/email/sender/EmailSender';
import axios from 'axios';

/**
 * Sendgrid Email Sender
 */
@Injectable()
export class SendgridEmailSender extends EmailSender {
  private static readonly API_BASE_URL = 'https://api.sendgrid.com/v3';

  private readonly logger: Logger;
  private readonly apiKey: string;

  public constructor(config: Config) {
    super(config);
    this.logger = new Logger(SendgridEmailSender.name);
    this.apiKey = config.get('SENDGRID_API_KEY');
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    // https://sendgrid.com/docs/API_Reference/api_v3.html
    // https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html
    // https://api.stoplight.io/v1/versions/E2KbzZkqZQttfyqxp/export/oas.json
    const url = SendgridEmailSender.API_BASE_URL + '/mail/send';
    const body = {
      personalizations: [
        {
          to: [{ email: options.to }],
          subject: options.subject,
        },
      ],
      from: {
        email: this.emailSenderAddress,
        name: this.emailSenderName,
      },
      content: [
        { type: 'text/plain', value: options.text },
        { type: 'text/html', value: options.html },
      ],
    };
    const config = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    };
    try {
      await axios.post(url, body, config);
    } catch (error) {
      if (!(error instanceof Error)) {
        this.logger.error(`Uncaught unknown error ${JSON.stringify(error)}`);
        throw new Error(error);
      }
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(error, 'Sendgrid api failure.');
    }
  }
}
