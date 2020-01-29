import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { LoggerService, InjectLogger } from 'logger';
import { Connection, EntityManager } from 'typeorm';
import { InjectDatabaseConnection } from 'database/database-connection';

@Injectable()
export class DatabaseClientService implements OnApplicationShutdown {
  private readonly connection: Connection;
  private readonly logger: LoggerService;

  public constructor(
    @InjectDatabaseConnection() connection: Connection,
    @InjectLogger() logger: LoggerService,
  ) {
    this.connection = connection;
    this.logger = logger;
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
