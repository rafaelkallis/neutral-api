import {
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
  Injectable,
} from '@nestjs/common';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Id } from 'shared/domain/value-objects/Id';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { Repository } from 'shared/domain/Repository';
import { Subscription } from 'shared/domain/Observer';
import { DomainEventBroker } from './DomainEventBroker';

@Injectable()
export class PersistedModelsDomainEventConnector
  implements OnModuleInit, OnApplicationShutdown {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly domainEventBroker: DomainEventBroker;
  private readonly persistedModelSubscriptions: Subscription[];

  public constructor(
    serviceExplorer: ServiceExplorer,
    domainEventBroker: DomainEventBroker,
  ) {
    this.logger = new Logger(PersistedModelsDomainEventConnector.name, true);
    this.serviceExplorer = serviceExplorer;
    this.domainEventBroker = domainEventBroker;
    this.persistedModelSubscriptions = [];
  }

  public async onModuleInit(): Promise<void> {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof Repository)) {
        continue;
      }
      const repository: Repository<Id, AggregateRoot<Id>> = service;
      const subscription = await repository.persistedModels.subscribe({
        handle: async (model: AggregateRoot<Id>): Promise<void> => {
          await this.domainEventBroker.publishFromAggregateRoot(model);
        },
      });
      this.logger.log(
        `Connected {${repository.constructor.name}} persisted models to domain event broker`,
      );
      this.persistedModelSubscriptions.push(subscription);
    }
  }

  public async onApplicationShutdown(): Promise<void> {
    for (const subscription of this.persistedModelSubscriptions) {
      await subscription.unsubscribe();
    }
  }
}
