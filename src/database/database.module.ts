import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';
import { DatabaseService } from 'database/database.service';
import { LoggerModule } from 'logger';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
