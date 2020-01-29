import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';
import { LoggerModule } from 'logger';
import { DatabaseClientService } from 'database/database-client.service';
import { DatabaseConnectionProvider } from 'database/database-connection';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [DatabaseConnectionProvider, DatabaseClientService],
  exports: [DatabaseClientService],
})
export class DatabaseModule {}
