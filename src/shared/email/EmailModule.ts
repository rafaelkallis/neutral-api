import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { SelfManagedEmailManager } from 'shared/email/manager/SelfManagedEmailManager';
import { EmailHtmlRenderer } from 'shared/email/html-renderer/EmailHtmlRenderer';
import { EmailPlaintextRenderer } from 'shared/email/plaintext-renderer/EmailPlaintextRenderer';
import { LiteralEmailPlaintextRenderer } from 'shared/email/plaintext-renderer/LiteralEmailPlaintextRenderer';
import { EmailSender } from 'shared/email/sender/EmailSender';
import { SmtpEmailSender } from 'shared/email/sender/SmtpEmailSender';
import { MjmlEmailHtmlRenderer } from 'shared/email/html-renderer/mjml/MjmlEmailHtmlRenderer';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { Environment } from 'shared/utility/application/Environment';
import { Config } from 'shared/config/application/Config';
import { SendgridEmailSender } from 'shared/email/sender/SendgridEmailSender';

/**
 * Email Module
 */
@Module({
  imports: [ConfigModule, UtilityModule],
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
      useFactory(environment: Environment, config: Config): EmailSender {
        if (environment.isProduction()) {
          return new SendgridEmailSender(config);
        }
        return new SmtpEmailSender(config);
      },
      inject: [Environment, Config],
    },
  ],
  exports: [EmailManager],
})
export class EmailModule {}
