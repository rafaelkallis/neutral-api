import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { EntityNotFoundInterceptor } from './interceptors/entity-not-found.interceptor';
import { ConfigService } from './services/config.service';
import { EmailService } from './services/email.service';
import { LogService } from './services/log.service';
import { RandomService } from './services/random.service';
import { TokenService } from './services/token.service';

/**
 * Common Module
 */
@Global()
@Module({
  providers: [
    RandomService,
    TokenService,
    LogService,
    ConfigService,
    EmailService,
    {
      provide: APP_INTERCEPTOR,
      useClass: EntityNotFoundInterceptor,
    },
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
