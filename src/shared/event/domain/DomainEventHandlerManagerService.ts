import 'reflect-metadata';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import {
  EventSubscriberService,
  EventSubscription,
  EventHandler,
  InjectEventSubscriber,
} from 'shared/event/subscriber/event-subscriber.service';
import { DomainEvent } from 'shared/event/domain/DomainEvent';
import {
  HandleDomainEventMetadataItem,
  HANDLE_DOMAIN_EVENT_METADATA,
} from 'shared/event/domain/HandleDomainEvent';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';

/**
 *
 */
@Injectable()
export class DomainEventHandlerManagerService
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly eventSubscriber: EventSubscriberService;
  private readonly domainEventSubscriptions: EventSubscription[];

  public constructor(
    serviceExplorer: ServiceExplorer,
    @InjectEventSubscriber() eventSubscriber: EventSubscriberService,
  ) {
    this.logger = new Logger(DomainEventHandlerManagerService.name, true);
    this.serviceExplorer = serviceExplorer;
    this.eventSubscriber = eventSubscriber;
    this.domainEventSubscriptions = [];
  }

  public async onModuleInit(): Promise<void> {
    await this.registerDomainEventHandlers();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.unregisterDomainEventHandlers();
  }

  private async registerDomainEventHandlers(): Promise<void> {
    for (const service of this.serviceExplorer.exploreServices()) {
      const metadataItems:
        | HandleDomainEventMetadataItem<DomainEvent>[]
        | undefined = Reflect.getMetadata(
        HANDLE_DOMAIN_EVENT_METADATA,
        service.constructor,
      );
      if (!metadataItems) {
        continue;
      }
      this.logger.log(`${service.constructor.name}:`);
      for (const { eventType, propertyKey } of metadataItems) {
        if (!(propertyKey in service)) {
          throw new Error();
        }
        const eventHandler: EventHandler<DomainEvent> = {
          async handleEvent(event: DomainEvent) {
            await (service as any)[propertyKey](event);
          },
        };
        const domainEventSubscription = await this.eventSubscriber.subscribe(
          eventType,
          eventHandler,
        );
        this.logger.log(
          `Registered {${
            eventType.name
          }, ${propertyKey.toString()}()} domain event handler`,
        );
        this.domainEventSubscriptions.push(domainEventSubscription);
      }
    }
    this.logger.log('Domain event handlers successfully registered');
  }

  private async unregisterDomainEventHandlers(): Promise<void> {
    for (const domainEventHandler of this.domainEventSubscriptions) {
      await domainEventHandler.unsubscribe();
    }
  }
}
