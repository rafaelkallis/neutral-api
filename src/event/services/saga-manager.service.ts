import 'reflect-metadata';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { SAGA_METADATA } from 'event/constants';
import { LoggerService, InjectLogger } from 'logger';
import { InjectEventSubscriber } from 'event/subscriber/inject-event-subscriber.decorator';
import {
  EventSubscriberService,
  EventSubscription,
  EventHandler,
} from 'event/subscriber/event-subscriber.service';
import { SagaMetadataItem } from 'event/services/saga-metadata-item';
import { AbstractEvent } from 'event/abstract.event';

@Injectable()
export class SagaManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: LoggerService;
  private readonly eventSubscriber: EventSubscriberService;
  private readonly modulesContainer: ModulesContainer;
  private readonly sagaEventSubscriptions: EventSubscription[];

  public constructor(
    @InjectLogger() logger: LoggerService,
    @InjectEventSubscriber() eventSubscriber: EventSubscriberService,
    modulesContainer: ModulesContainer,
  ) {
    this.logger = logger;
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
        if (!instance) {
          continue;
        }
        const metadataItems:
          | SagaMetadataItem<AbstractEvent>[]
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
          const eventHandler: EventHandler<AbstractEvent> = {
            async handleEvent(event: AbstractEvent) {
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
