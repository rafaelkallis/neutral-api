import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService, InjectConfig } from 'config';
import {
  EmailSenderService,
  SendEmailOptions,
} from 'email/email-sender/email-sender.service';
import { Transporter, createTransport } from 'nodemailer';
import { LoggerService, InjectLogger } from 'logger';

/**
 * Smtp Email Sender
 */
@Injectable()
export class SmtpEmailSenderService
  implements EmailSenderService, OnModuleInit, OnModuleDestroy {
  private readonly logger: LoggerService;
  private readonly transporter: Transporter;

  public constructor(
    @InjectLogger() logger: LoggerService,
    @InjectConfig() config: ConfigService,
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
