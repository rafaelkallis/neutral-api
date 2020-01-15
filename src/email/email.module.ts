import { Module, HttpModule } from '@nestjs/common';
import { EMAIL_SENDER } from 'email/email-sender';
import { SendgridEmailSender } from 'email/sendgrid-email-sender';
import { ConfigModule } from 'config';
import { EmailSagasService } from 'email/email-sagas.service';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    {
      provide: EMAIL_SENDER,
      useClass: SendgridEmailSender,
    },
    EmailSagasService,
  ],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
