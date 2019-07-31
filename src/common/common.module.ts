import { Module } from '@nestjs/common';
import { RandomService } from './random/random.service';
import { TokenService } from './token/token.service';
import { LogService } from './log/log.service';
import { ConfigService } from './config/config.service';
import { EmailService } from './email/email.service';

@Module({
  providers: [
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
  ],
  exports: [
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
  ],
})
export class CommonModule {}
