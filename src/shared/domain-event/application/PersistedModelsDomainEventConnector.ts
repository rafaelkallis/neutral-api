import { Logger, Injectable } from '@nestjs/common';
import { AggregateRoot } from 'shared/domain/AggregateRoot';
import { Id } from 'shared/domain/value-objects/Id';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { Repository } from 'shared/domain/Repository';
import { DomainEventBroker } from './DomainEventBroker';
import { Connector } from 'shared/application/Connector';

@Injectable()
export class PersistedModelsDomainEventConnector extends Connector {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(
    serviceExplorer: ServiceExplorer,
    domainEventBroker: DomainEventBroker,
  ) {
    super();
    this.logger = new Logger(PersistedModelsDomainEventConnector.name, true);
    this.serviceExplorer = serviceExplorer;
    this.domainEventBroker = domainEventBroker;
  }

  protected async connect(): Promise<void> {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof Repository)) {
        continue;
      }
      const subscription = await service.persistedModels.subscribe({
        handle: async (model: AggregateRoot<Id>): Promise<void> => {
          await this.domainEventBroker.publishFromAggregateRoot(model);
        },
      });
      this.logger.log(
        `Connected {${service.constructor.name}} persisted models to domain event broker`,
      );
      this.manageSuscription(subscription);
    }
  }
}
