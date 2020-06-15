import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import {
  getDomainEventHandlerMetadataItems,
  DomainEventHandlerMetadataItem,
  getDomainEventHandlerClasses,
} from 'shared/domain-event/application/DomainEventHandler';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';
import { Subscription } from 'shared/domain/Observer';

@Injectable()
export class DomainEventHandlerConnector
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly serviceLocator: ServiceLocator;
  private readonly domainEventBroken: DomainEventBroker;
  private readonly subscriptions: Subscription[];

  public constructor(
    domainEventBroker: DomainEventBroker,
    serviceLocator: ServiceLocator,
  ) {
    this.logger = new Logger(DomainEventHandlerConnector.name, true);
    this.serviceLocator = serviceLocator;
    this.domainEventBroken = domainEventBroker;
    this.subscriptions = [];
  }

  public async onModuleInit(): Promise<void> {
    await this.connectDomainEventHandlers();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.unconnectDomainEventHandlers();
  }

  private async connectDomainEventHandlers(): Promise<void> {
    for (const registered of getDomainEventHandlerClasses()) {
      const resolved = await this.serviceLocator.getService(registered);
      if (!resolved) {
        continue;
      }
      const metadataItems = getDomainEventHandlerMetadataItems(resolved);
      for (const metadataItem of metadataItems) {
        await this.connectDomainEventHandler(resolved, metadataItem);
      }
    }
    this.logger.log('Domain event handlers successfully registered');
  }

  private async connectDomainEventHandler<T extends DomainEvent>(
    service: object,
    metadataItem: DomainEventHandlerMetadataItem<T>,
  ): Promise<void> {
    const { domainEventType, servicePropertyKey, handlerKey } = metadataItem;
    const domainEventSubscription = await this.domainEventBroken.subscribe(
      domainEventType,
      {
        key: handlerKey,
        async handle(domainEvent: T): Promise<void> {
          await (service as any)[servicePropertyKey](domainEvent);
        },
      },
    );
    this.subscriptions.push(domainEventSubscription);
    this.logger.log(
      `Registered {${
        service.constructor.name
      }, ${servicePropertyKey.toString()}, ${
        domainEventType.name
      }, ${handlerKey}} domain event handler`,
    );
  }

  private async unconnectDomainEventHandlers(): Promise<void> {
    for (const domainEventSubscription of this.subscriptions) {
      await domainEventSubscription.unsubscribe();
    }
  }
}
