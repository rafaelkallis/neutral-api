import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from 'config';
import { EmailSagasService } from 'email/email-sagas.service';
import { EMAIL_TEMPLATE_ENGINE } from 'email/email-template-engine.service';
import { HandlebarsEmailTemplateEngineService } from 'email/handlebars-email-template-engine.service';
import { EMAIL_SERVICE } from 'email/email.service';
import { SendgridEmailService } from 'email/sendgrid-email.service';

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
      provide: EMAIL_TEMPLATE_ENGINE,
      useClass: HandlebarsEmailTemplateEngineService,
    },
    EmailSagasService,
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
