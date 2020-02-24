import {
  Injectable,
  OnModuleInit,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import apm from 'elastic-apm-node/start';
import { Config, InjectConfig } from 'config/application/Config';
import { Request, Response } from 'express';
import { Apm, ApmTransaction, ApmActivity } from 'apm/application/Apm';
import { User } from 'user/domain/User';

/**
 * Elastic Apm Service
 */
@Injectable()
export class ElasticApmService extends Apm
  implements OnModuleInit, OnApplicationShutdown {
  private readonly logger: Logger;

  public constructor(@InjectConfig() _config: Config) {
    super();
    this.logger = new Logger(ElasticApmService.name, true);
  }

  public onModuleInit(): void {
    this.logger.log('Elastic apm connected');
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.flushApm();
    this.logger.log('Elastic apm flushed');
  }

  /**
   *
   */
  public createTransaction(
    _request: Request,
    _response: Response,
    authUser?: User,
  ): ApmTransaction {
    return new ElasticApmTransaction(authUser);
  }

  /**
   *
   */
  private async flushApm(): Promise<void> {
    await new Promise((resolve, reject) => {
      apm.flush((err: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

class ElasticApmTransaction implements ApmTransaction {
  private readonly transaction: any;

  public constructor(authUser?: User) {
    this.transaction = apm.currentTransaction;
    if (authUser) {
      apm.setUserContext({ id: authUser.id.value });
    }
  }

  public createActivity(name: string): ApmActivity {
    return new ElasticApmActivity(this.transaction, name);
  }

  public success(): void {
    this.transaction.end('success');
  }

  public failure(error: Error): void {
    apm.captureError(error);
    this.transaction.end('failure');
  }
}

class ElasticApmActivity implements ApmActivity {
  private readonly span: any;

  public constructor(transaction: any, name: string) {
    // @see https://www.elastic.co/guide/en/apm/agent/nodejs/3.x/transaction-api.html#transaction-start-span
    this.span = transaction.startSpan(name);
  }

  end(): void {
    this.span.end();
  }
}
