import { Module } from '@nestjs/common';
import { ConfigModule } from 'config/ConfigModule';
import { DatabaseClientService } from 'database/DatabaseClientService';
import { DatabaseConnectionProvider } from 'database/DatabaseConnectionProdiver';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule],
  providers: [DatabaseConnectionProvider, DatabaseClientService],
  exports: [DatabaseClientService],
})
export class DatabaseModule {}
