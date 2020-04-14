import {
  Injectable,
  OnApplicationShutdown,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import {
  DomainEventBroker,
  DomainEventSubscription,
} from 'shared/domain-event/application/DomainEventBroker';
import {
  getDomainEventHandlerMetadataItems,
  DomainEventHandlerMetadataItem,
} from 'shared/domain-event/application/DomainEventHandler';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

@Injectable()
export class DomainEventHandlerRegistrar
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly domainEventBroken: DomainEventBroker;
  private readonly domainEventSubscriptions: DomainEventSubscription[];

  public constructor(
    serviceExplorer: ServiceExplorer,
    domainEventBroker: DomainEventBroker,
  ) {
    this.logger = new Logger(DomainEventHandlerRegistrar.name, true);
    this.serviceExplorer = serviceExplorer;
    this.domainEventBroken = domainEventBroker;
    this.domainEventSubscriptions = [];
  }

  public async onApplicationBootstrap(): Promise<void> {
    await this.registerDomainEventHandlers();
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.unregisterDomainEventHandlers();
  }

  private async registerDomainEventHandlers(): Promise<void> {
    for (const service of this.serviceExplorer.exploreServices()) {
      const metadataItems = getDomainEventHandlerMetadataItems(service);
      for (const metadataItem of metadataItems) {
        await this.registerDomainEventHandler(service, metadataItem);
      }
    }
    this.logger.log('Domain event handlers successfully registered');
  }

  private async registerDomainEventHandler<T extends DomainEvent>(
    service: object,
    metadataItem: DomainEventHandlerMetadataItem<T>,
  ): Promise<void> {
    const { domainEventType, servicePropertyKey, handlerKey } = metadataItem;
    const domainEventSubscription = await this.domainEventBroken.subscribe(
      domainEventType,
      {
        key: handlerKey,
        async handleDomainEvent(domainEvent: T): Promise<void> {
          await (service as any)[servicePropertyKey](domainEvent);
        },
      },
    );
    this.domainEventSubscriptions.push(domainEventSubscription);
    this.logger.log(
      `Registered {${
        service.constructor.name
      }, ${servicePropertyKey.toString()}, ${
        domainEventType.name
      }, ${handlerKey}} domain event handler`,
    );
  }

  private async unregisterDomainEventHandlers(): Promise<void> {
    for (const domainEventSubscription of this.domainEventSubscriptions) {
      await domainEventSubscription.unsubscribe();
    }
  }
}
