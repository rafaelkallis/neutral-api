import { Module } from '@nestjs/common';
import { ConfigModule } from 'shared/config/ConfigModule';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { DatabaseConnectionProvider } from 'shared/database/DatabaseConnectionProdiver';

/**
 * Database Module
 */
@Module({
  imports: [ConfigModule],
  providers: [DatabaseConnectionProvider, DatabaseClientService],
  exports: [DatabaseClientService],
})
export class DatabaseModule {}
