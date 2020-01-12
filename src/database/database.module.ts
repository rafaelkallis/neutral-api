import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';
import { Database } from 'database/database';
import { DatabaseImpl } from 'database/database-impl';
import { DATABASE } from 'database/constants';
import { LoggerModule } from 'logger';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [{ provide: DATABASE, useClass: DatabaseImpl }],
  exports: [DATABASE],
})
export class DatabaseModule {}
