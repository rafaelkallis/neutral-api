import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from 'config';
import { EmailSagasService } from 'email/email-sagas.service';
import { EMAIL_SERVICE } from 'email/email.service';
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
import { LoggerModule } from 'logger';

/**
 * Email Module
 */
@Module({
  imports: [LoggerModule, ConfigModule, HttpModule],
  providers: [
    {
      provide: EMAIL_SERVICE,
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
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
