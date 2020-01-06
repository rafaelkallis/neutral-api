import { Module } from '@nestjs/common';

import { LogService } from './services/log.service';
import { RandomService } from './services/random.service';
import { TokenService } from './services/token.service';
import { ConfigModule } from 'config';

/**
 * Common Module
 */
@Module({
  imports: [ConfigModule],
  providers: [RandomService, TokenService, LogService],
  exports: [RandomService, TokenService, LogService],
})
export class CommonModule {}
