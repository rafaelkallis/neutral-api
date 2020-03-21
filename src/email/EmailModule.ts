import { Module } from '@nestjs/common';
import { ConfigModule } from 'config/ConfigModule';
import { EmailSagasService } from 'email/email-sagas.service';
import { EmailManager } from 'email/EmailManager';
import { EMAIL_SENDER, SmtpEmailSenderService } from 'email/email-sender';
import {
  EMAIL_HTML_RENDERER,
  NunjucksEmailHtmlRendererService,
} from 'email/email-html-renderer';
import {
  EMAIL_PLAINTEXT_RENDERER,
  DefaultEmailPlaintextRendererService,
} from 'email/email-plaintext-renderer';
import { SelfManagedEmailService } from 'email/self-managed-email.service';

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
