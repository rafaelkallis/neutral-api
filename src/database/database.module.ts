import { Module } from '@nestjs/common';
import { ConfigModule } from 'config';
import { DatabaseClientService } from 'database/database-client.service';
import { DatabaseConnectionProvider } from 'database/database-connection';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule],
  providers: [DatabaseConnectionProvider, DatabaseClientService],
  exports: [DatabaseClientService],
})
export class DatabaseModule {}
