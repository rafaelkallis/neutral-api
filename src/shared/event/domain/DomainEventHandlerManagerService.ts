import 'reflect-metadata';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
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

/**
 *
 */
@Injectable()
export class DomainEventHandlerManagerService
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly eventSubscriber: EventSubscriberService;
  private readonly modulesContainer: ModulesContainer;
  private readonly sagaEventSubscriptions: EventSubscription[];

  public constructor(
    @InjectEventSubscriber() eventSubscriber: EventSubscriberService,
    modulesContainer: ModulesContainer,
  ) {
    this.logger = new Logger(DomainEventHandlerManagerService.name, true);
    this.eventSubscriber = eventSubscriber;
    this.modulesContainer = modulesContainer;
    this.sagaEventSubscriptions = [];
  }

  public async onModuleInit(): Promise<void> {
    await this.registerSagas();
  }

  public async onModuleDestroy(): Promise<void> {
    await this.unsubscribeSagaSubscriptions();
  }

  private async registerSagas(): Promise<void> {
    for (const module of this.modulesContainer.values()) {
      for (const instanceWrapper of module.providers.values()) {
        const { instance } = instanceWrapper;
        if (typeof instance !== 'object' || !instance) {
          continue;
        }
        const metadataItems:
          | HandleDomainEventMetadataItem<DomainEvent>[]
          | undefined = Reflect.getMetadata(
          HANDLE_DOMAIN_EVENT_METADATA,
          instance.constructor,
        );
        if (!metadataItems) {
          continue;
        }
        this.logger.log(`${instanceWrapper.name}:`);
        for (const { eventType, propertyKey } of metadataItems) {
          if (!(propertyKey in instance)) {
            throw new Error();
          }
          const eventHandler: EventHandler<DomainEvent> = {
            async handleEvent(event: DomainEvent) {
              await (instance as any)[propertyKey](event);
            },
          };
          const sagaEventSubscription = await this.eventSubscriber.subscribe(
            eventType,
            eventHandler,
          );
          this.logger.log(
            `Registered {${eventType.name}, ${propertyKey.toString()}()} saga`,
          );
          this.sagaEventSubscriptions.push(sagaEventSubscription);
        }
      }
    }
    this.logger.log('Sagas successfully registered');
  }

  private async unsubscribeSagaSubscriptions(): Promise<void> {
    for (const sagaSubscription of this.sagaEventSubscriptions) {
      await sagaSubscription.unsubscribe();
    }
  }
}
