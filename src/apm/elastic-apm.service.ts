import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoggerService, InjectLogger } from 'logger';
import apm from 'elastic-apm-node/start';
import { ConfigService, InjectConfig } from 'config';
import { Request } from 'express';
import { ApmService, ApmTransaction } from 'apm/apm.service';
import { UserEntity } from 'user';

/**
 * Elastic Apm Service
 */
@Injectable()
export class ElasticApmService extends ApmService
  implements OnModuleInit, OnModuleDestroy {
  private readonly config: ConfigService;
  private readonly logger: LoggerService;

  public constructor(
    @InjectConfig() config: ConfigService,
    @InjectLogger() logger: LoggerService,
  ) {
    super();
    this.config = config;
    this.logger = logger;
  }

  public async onModuleInit(): Promise<void> {
    await this.startApm();
    this.logger.log('Elastic apm connected');
  }

  public async onModuleDestroy(): Promise<void> {
    await this.stopApm();
    this.logger.log('Elastic apm disconnected');
  }

  /**
   *
   */
  public createTransaction(
    _request: Request,
    authUser?: UserEntity,
  ): ApmTransaction {
    const transaction = apm.startTransaction();
    if (!transaction) {
      throw new InternalServerErrorException();
    }
    if (authUser) {
      apm.setUserContext({
        id: authUser.id,
        email: authUser.email,
      });
    }
    return {
      success(): void {
        transaction.end('success');
      },
      failure(error: Error): void {
        apm.captureError(error);
        transaction.end('failure');
      },
    };
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
  private async stopApm(): Promise<void> {
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
