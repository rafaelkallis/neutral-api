import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';

import { Database } from 'database/database';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule],
  providers: [Database],
  exports: [Database],
})
export class DatabaseModule {}
