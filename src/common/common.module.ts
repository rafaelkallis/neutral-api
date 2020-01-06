import { Module } from '@nestjs/common';

import { RandomService } from './services/random.service';
import { TokenService } from './services/token.service';
import { ConfigModule } from 'config';

/**
 * Common Module
 */
@Module({
  imports: [ConfigModule],
  providers: [RandomService, TokenService],
  exports: [RandomService, TokenService],
})
export class CommonModule {}
