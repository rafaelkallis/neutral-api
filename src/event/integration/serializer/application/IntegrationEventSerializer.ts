import 'reflect-metadata';
import { OnModuleInit, Type, Logger, Inject } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { IntegrationEvent } from 'event/integration/IntegrationEvent';
import { getIntegrationEventKey } from 'event/integration/IntegrationEventKey';
import { getHandleIntegrationEventMetadataItems } from 'event/integration/HandleIntegrationEvent';

export const INTEGRATION_EVENT_SERIALIZER = Symbol(
  'INTEGRATION_EVENT_SERIALIZER',
);

export function InjectIntegrationEventSerializer(): ParameterDecorator {
  return Inject(INTEGRATION_EVENT_SERIALIZER);
}

/**
 *
 */
export abstract class IntegrationEventSerializer implements OnModuleInit {
  public static readonly EVENT_KEY_FIELD = '_type';

  private readonly logger: Logger;
  private readonly modulesContainer: ModulesContainer;
  private readonly eventTypeMap: Map<string, Type<IntegrationEvent>>;

  public constructor(logger: Logger, modulesContainer: ModulesContainer) {
    this.logger = logger;
    this.modulesContainer = modulesContainer;
    this.eventTypeMap = new Map();
  }

  public async onModuleInit(): Promise<void> {
    await this.registerIntegrationEvents();
  }

  /**
   *
   */
  public abstract serialize(event: IntegrationEvent): Buffer;

  /**
   *
   */
  public abstract deserialize(buffer: Buffer): IntegrationEvent;

  /**
   *
   */
  protected getEventType(eventKey: string): Type<IntegrationEvent> {
    const eventType = this.eventTypeMap.get(eventKey);
    if (!eventType) {
      throw new Error();
    }
    return eventType;
  }

  /**
   *
   */
  protected hasEventType(eventKey: string): boolean {
    return this.eventTypeMap.has(eventKey);
  }

  private async registerIntegrationEvents(): Promise<void> {
    for (const module of this.modulesContainer.values()) {
      for (const instanceWrapper of module.providers.values()) {
        const { instance } = instanceWrapper;
        if (typeof instance !== 'object' || !instance) {
          continue;
        }
        const metadataItems = getHandleIntegrationEventMetadataItems(instance);
        if (!metadataItems.length) {
          continue;
        }
        for (const { eventType } of metadataItems) {
          const eventKey = getIntegrationEventKey(eventType);
          this.eventTypeMap.set(eventKey, eventType);
          this.logger.log(
            `Registered {${eventKey} -> ${eventType.name}} serializer`,
          );
        }
      }
    }
    this.logger.log('Event serializers successfully registered');
  }
}
