import { Injectable, Logger } from '@nestjs/common';
import { EmailSender } from './EmailSender';

@Injectable()
export class DummyEmailSender extends EmailSender {
  private readonly logger: Logger;

  public constructor() {
    super();
    this.logger = new Logger(DummyEmailSender.name);
  }

  public async sendEmail(): Promise<void> {
    this.logger.warn('email not sent');
  }
}
