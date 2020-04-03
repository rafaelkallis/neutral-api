import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { EmailDomainEventHandlers } from 'shared/email/EmailDomainEventHandlers';
import { EmailManager } from 'shared/email/EmailManager';
import { SelfManagedEmailManager } from 'shared/email/SelfManagedEmailManager';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import { NunjucksEmailHtmlRenderer } from 'shared/email/html-renderer/NunjucksEmailHtmlRenderer';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';
import { LiteralEmailPlaintextRenderer } from 'shared/email/plaintext-renderer/LiteralEmailPlaintextRenderer';
import { EmailSender } from 'shared/email/sender/EmailSender';
import { SmtpEmailSender } from 'shared/email/sender/SmtpEmailSender';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EmailManager,
      useClass: SelfManagedEmailManager,
    },
    {
      provide: EmailHtmlRenderer,
      useClass: NunjucksEmailHtmlRenderer,
    },
    {
      provide: EmailPlaintextRenderer,
      useClass: LiteralEmailPlaintextRenderer,
    },
    {
      provide: EmailSender,
      useClass: SmtpEmailSender,
    },
    EmailDomainEventHandlers,
  ],
  exports: [EmailManager],
})
export class EmailModule {}
