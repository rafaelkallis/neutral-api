import 'reflect-metadata';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { EventSubscription, EventHandler } from 'event/event-subscriber';
import { SAGA_METADATA } from 'event/constants';
import { Event } from 'event/event';
import { EVENT_BUS, EventBus } from 'event/event-bus';
import { SagaMetadataItem } from 'event/saga-metadata-item';
import { LOGGER, Logger } from 'logger';

@Injectable()
export class SagaManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly eventBus: EventBus;
  private readonly modulesContainer: ModulesContainer;
  private readonly sagaEventSubscriptions: EventSubscription[];

  public constructor(
    @Inject(LOGGER) logger: Logger,
    @Inject(EVENT_BUS) eventBus: EventBus,
    modulesContainer: ModulesContainer,
  ) {
    this.logger = logger;
    this.eventBus = eventBus;
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
        if (!instance) {
          continue;
        }
        const metadataItems:
          | SagaMetadataItem<Event>[]
          | undefined = Reflect.getMetadata(
          SAGA_METADATA,
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
          const eventHandler: EventHandler<Event> = {
            async handleEvent(event: Event) {
              await (instance as any)[propertyKey](event);
            },
          };
          const sagaEventSubscription = await this.eventBus.subscribe(
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
  }

  private async unsubscribeSagaSubscriptions(): Promise<void> {
    for (const sagaSubscription of this.sagaEventSubscriptions) {
      await sagaSubscription.unsubscribe();
    }
  }
}
