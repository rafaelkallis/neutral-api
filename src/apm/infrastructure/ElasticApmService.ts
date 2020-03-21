import apm from 'elastic-apm-node';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Request, Response } from 'express';
import { Apm, ApmTransaction, ApmActivity } from 'apm/application/Apm';
import { User } from 'user/domain/User';
import { Config } from 'config/application/Config';

/**
 * Elastic Apm Service
 */
@Injectable()
export class ElasticApmService extends Apm implements OnModuleInit {
  private readonly logger: Logger;
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.logger = new Logger(ElasticApmService.name, true);
    this.config = config;
  }

  public onModuleInit(): void {
    if (!apm.isStarted()) {
      this.logger.warn('Elastic apm not started');
      if (!this.config.isTest()) {
        throw new Error('Elastic apm not started');
      }
    }
  }

  /**
   *
   */
  public createTransaction(
    _request: Request,
    _response: Response,
    authUser?: User,
  ): ApmTransaction {
    const transaction = apm.startTransaction();
    return new ElasticApmTransaction(transaction, authUser);
  }
}

class ElasticApmTransaction implements ApmTransaction {
  private readonly transaction: any;

  public constructor(transaction: any, authUser?: User) {
    this.transaction = transaction;
    if (authUser) {
      this.transaction.setUserContext({ id: authUser.id.value });
    }
  }

  public createActivity(name: string): ApmActivity {
    // @see https://www.elastic.co/guide/en/apm/agent/nodejs/3.x/transaction-api.html#transaction-start-span
    const span = this.transaction.startSpan(name);
    return new ElasticApmActivity(span);
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

  public constructor(span: any) {
    this.span = span;
  }

  end(): void {
    this.span.end();
  }
}
