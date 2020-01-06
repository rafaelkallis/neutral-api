import { Module } from '@nestjs/common';
import { EMAIL_SENDER } from 'email/email-sender';
import { SendgridEmailSender } from 'email/sendgrid-email-sender';
import { ConfigModule } from 'config';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SENDER,
      useClass: SendgridEmailSender,
    },
  ],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
