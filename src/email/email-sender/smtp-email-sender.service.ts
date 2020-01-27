import {
  Injectable,
  NotImplementedException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Config, InjectConfig } from 'config';
import {
  EmailSenderService,
  SendEmailOptions,
} from 'email/email-sender/email-sender.service';
import { Transporter, createTransport } from 'nodemailer';
import { Logger, InjectLogger } from 'logger';

/**
 * Smtp Email Sender
 */
@Injectable()
export class SmtpEmailSenderService
  implements EmailSenderService, OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly transporter: Transporter;

  public constructor(
    @InjectLogger() logger: Logger,
    @InjectConfig() config: Config,
  ) {
    this.logger = logger;
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
