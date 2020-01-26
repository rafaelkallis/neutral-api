import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from 'config';
import { EmailSagasService } from 'email/email-sagas.service';
import { EMAIL_SERVICE } from 'email/email.service';
import { SendgridEmailService } from 'email/sendgrid-email.service';
import { EMAIL_SENDER, SendgridEmailSenderService } from 'email/email-sender';
import {
  EMAIL_HTML_RENDERER,
  NunjucksEmailHtmlRendererService,
} from 'email/email-html-renderer';
import {
  EMAIL_PLAINTEXT_RENDERER,
  DefaultEmailPlaintextRendererService,
} from 'email/email-plaintext-renderer';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: SendgridEmailService,
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
      useClass: SendgridEmailSenderService,
    },
    EmailSagasService,
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
