import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import {
  EmailSenderService,
  SendEmailOptions,
} from 'shared/email/email-sender/email-sender.service';
import { Transporter, createTransport } from 'nodemailer';

/**
 * Smtp Email Sender
 */
@Injectable()
export class SmtpEmailSenderService
  implements EmailSenderService, OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly transporter: Transporter;

  public constructor(config: Config) {
    this.logger = new Logger(SmtpEmailSenderService.name, true);
    const smtpUrl = config.get('SMTP_URL');
    this.transporter = createTransport(smtpUrl);
  }

  public async onModuleInit(): Promise<void> {
    await this.transporter.verify();
    this.logger.log('Smtp connected');
  }

  public async onModuleDestroy(): Promise<void> {
    this.transporter.close();
    this.logger.log('Smtp disconnected');
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    const mailOptions = {
      // TODO change to no-reply@covee.network
      from: 'no-reply@example.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
