import {
  Injectable,
  OnModuleInit,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { EmailSender, SendEmailOptions } from 'shared/email/sender/EmailSender';
import { Transporter, createTransport } from 'nodemailer';

/**
 * Smtp Email Sender
 */
@Injectable()
export class SmtpEmailSender extends EmailSender
  implements OnModuleInit, OnApplicationShutdown {
  private readonly logger: Logger;
  private readonly transporter: Transporter;
  private readonly emailSender: string;

  public constructor(config: Config) {
    super();
    this.logger = new Logger(SmtpEmailSender.name, true);
    const smtpUrl = config.get('SMTP_URL');
    this.transporter = createTransport(smtpUrl);
    this.emailSender = config.get('EMAIL_SENDER');
  }

  public async onModuleInit(): Promise<void> {
    await this.transporter.verify();
    this.logger.log('Smtp connected');
  }

  public async onApplicationShutdown(): Promise<void> {
    this.transporter.close();
    this.logger.log('Smtp disconnected');
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    const mailOptions = {
      from: this.emailSender,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
