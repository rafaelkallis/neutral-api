import { OnModuleInit, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Repository } from 'shared/domain/Repository';
import { Subscription } from 'shared/domain/Observer';
import { DomainEventBroker } from './DomainEventBroker';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';

@Injectable()
export class PersistedModelsDomainEventConnector
  implements OnModuleInit, OnModuleDestroy {
  private readonly domainEventBroker: DomainEventBroker;
  private readonly serviceLocator: ServiceLocator;
  private readonly subscriptions: Subscription[];

  public constructor(
    domainEventBroker: DomainEventBroker,
    serviceLocator: ServiceLocator,
  ) {
    this.domainEventBroker = domainEventBroker;
    this.serviceLocator = serviceLocator;
    this.subscriptions = [];
  }

  public async onModuleInit(): Promise<void> {
    const registeredRepositories = Repository.registry.keys();
    const resolvedRepositories = await this.serviceLocator.getServices(
      registeredRepositories,
    );
    for (const resolvedRepository of resolvedRepositories) {
      const subscription = await resolvedRepository.persistedModels.subscribe({
        handle: async (aggregateRoot) =>
          this.domainEventBroker.publish(...aggregateRoot.domainEvents),
      });
      this.subscriptions.push(subscription);
    }
  }

  public async onModuleDestroy(): Promise<void> {
    for (const subscription of this.subscriptions) {
      await subscription.unsubscribe();
    }
  }
}
