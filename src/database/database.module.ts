import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';

import { Database, DATABASE } from 'database/database';
import { DatabaseImpl } from 'database/database-impl';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule],
  providers: [{ provide: DATABASE, useClass: DatabaseImpl }],
  exports: [DATABASE],
})
export class DatabaseModule {}
