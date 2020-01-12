import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';
import { Database } from 'database/database';
import { DatabaseImpl } from 'database/database-impl';
import { DATABASE } from 'database/constants';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule],
  providers: [{ provide: DATABASE, useClass: DatabaseImpl }],
  exports: [DATABASE],
})
export class DatabaseModule {}
