import { Injectable, NotImplementedException } from '@nestjs/common';
import { Config, InjectConfig } from 'config';
import {
  EmailSenderService,
  SendEmailOptions,
} from 'email/email-sender/email-sender.service';

/**
 * Smtp Email Sender
 */
@Injectable()
export class SmtpEmailSenderService implements EmailSenderService {
  private readonly config: Config;

  public constructor(@InjectConfig() config: Config) {
    this.config = config;
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    throw new NotImplementedException('SmtpEmailSender.sendEmail()');
  }
}
