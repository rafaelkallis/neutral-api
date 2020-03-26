import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { EmailSagasService } from 'shared/email/email-sagas.service';
import { EmailManager } from 'shared/email/EmailManager';
import {
  EMAIL_SENDER,
  SmtpEmailSenderService,
} from 'shared/email/email-sender';
import {
  EMAIL_HTML_RENDERER,
  NunjucksEmailHtmlRendererService,
} from 'shared/email/email-html-renderer';
import {
  EMAIL_PLAINTEXT_RENDERER,
  DefaultEmailPlaintextRendererService,
} from 'shared/email/email-plaintext-renderer';
import { SelfManagedEmailService } from 'shared/email/self-managed-email.service';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EmailManager,
      useClass: SelfManagedEmailService,
    },
    {
      provide: EMAIL_HTML_RENDERER,
      useClass: NunjucksEmailHtmlRendererService,
    },
    {
      provide: EMAIL_PLAINTEXT_RENDERER,
      useClass: DefaultEmailPlaintextRendererService,
    },
    {
      provide: EMAIL_SENDER,
      useClass: SmtpEmailSenderService,
    },
    EmailSagasService,
  ],
  exports: [EmailManager],
})
export class EmailModule {}
