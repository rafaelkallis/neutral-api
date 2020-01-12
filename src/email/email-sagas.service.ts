import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { EmailSender, EMAIL_SENDER } from 'email/email-sender';

/**
 * Email Sagas Service
 */
@Injectable()
export class EmailSagasService {
  private readonly emailSender: EmailSender;

  public constructor(@Inject(EMAIL_SENDER) emailSender: EmailSender) {
    this.emailSender = emailSender;
  }
}
