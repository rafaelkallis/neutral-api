import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import apm from 'elastic-apm-node';
import { ConfigService, InjectConfig } from 'config';
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
  private readonly config: ConfigService;

  public constructor(@InjectConfig() config: ConfigService) {
    super();
    this.logger = new Logger(ElasticApmService.name, true);
    this.config = config;
  }

  public async onModuleInit(): Promise<void> {
    await this.startApm();
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
    request: Request,
    response: Response,
    authUser?: User,
  ): ApmTransaction {
    return new ElasticApmTransaction(apm, request, response, authUser);
  }

  /**
   *
   */
  private async startApm(): Promise<void> {
    if (apm.isStarted()) {
      return;
    }
    apm.start({
      serviceName: this.config.get('SERVER_NAME'),
      secretToken: this.config.get('ELASTIC_APM_SECRET_TOKEN'),
      serverUrl: this.config.get('ELASTIC_APM_SERVER_URL'),
    });
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

  public constructor(
    apm: any,
    request: Request,
    response: Response,
    authUser?: User,
  ) {
    const name = this.getPath(request);
    const type = 'request';
    const transaction = apm.startTransaction(name, type);
    if (!transaction) {
      throw new InternalServerErrorException();
    }
    this.transaction = transaction;
    this.transaction.req = request;
    this.transaction.res = response;
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

  private getPath(request: Request): string {
    return request.route.path;
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
