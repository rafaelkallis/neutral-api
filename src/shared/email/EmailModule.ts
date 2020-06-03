import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { EmailDomainEventHandlers } from 'shared/email/EmailDomainEventHandlers';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { SelfManagedEmailManager } from 'shared/email/manager/SelfManagedEmailManager';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';
import { LiteralEmailPlaintextRenderer } from 'shared/email/plaintext-renderer/LiteralEmailPlaintextRenderer';
import { EmailSender } from 'shared/email/sender/EmailSender';
import { SmtpEmailSender } from 'shared/email/sender/SmtpEmailSender';
import { MjmlEmailHtmlRenderer } from 'shared/email/html-renderer/mjml/MjmlEmailHtmlRenderer';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { UserModule } from 'user/UserModule';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule, UtilityModule, forwardRef(() => UserModule)],
  providers: [
    {
      provide: EmailManager,
      useClass: SelfManagedEmailManager,
    },
    {
      provide: EmailHtmlRenderer,
      useClass: MjmlEmailHtmlRenderer,
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
