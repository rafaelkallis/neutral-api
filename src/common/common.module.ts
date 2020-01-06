import { Module } from '@nestjs/common';

import { RandomService } from './services/random.service';
import { ConfigModule } from 'config';

/**
 * Common Module
 */
@Module({
  imports: [ConfigModule],
  providers: [RandomService],
  exports: [RandomService],
})
export class CommonModule {}
