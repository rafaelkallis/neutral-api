import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { InjectDatabaseConnection } from 'database/DatabaseConnectionProdiver';

@Injectable()
export class DatabaseClientService implements OnApplicationShutdown {
  private readonly logger: Logger;
  private readonly connection: Connection;

  public constructor(@InjectDatabaseConnection() connection: Connection) {
    this.logger = new Logger(DatabaseClientService.name, true);
    this.connection = connection;
    this.logger.log('Database connected');
  }

  /**
   *
   */
  public getEntityManager(): EntityManager {
    return this.connection.manager;
  }

  /**
   *
   */
  public async onApplicationShutdown(): Promise<void> {
    await this.connection.close();
    this.logger.log('Database disconnected');
  }
}
