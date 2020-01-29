import 'reflect-metadata';
import { OnModuleInit, Type, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { HANDLE_EVENT_METADATA, EVENT_METADATA } from 'event/constants';
import { AbstractEvent } from 'event/abstract.event';
import { HandleEventMetadataItem } from 'event/services/handle-event-metadata-item';

export abstract class EventSerializerService implements OnModuleInit {
  public static readonly EVENT_KEY_FIELD = '_type';

  private readonly logger: Logger;
  private readonly modulesContainer: ModulesContainer;
  private readonly eventTypeMap: Map<string, Type<AbstractEvent>>;

  public constructor(logger: Logger, modulesContainer: ModulesContainer) {
    this.logger = logger;
    this.modulesContainer = modulesContainer;
    this.eventTypeMap = new Map();
  }

  public async onModuleInit(): Promise<void> {
    await this.registerEventTypes();
  }

  /**
   *
   */
  public abstract serialize(event: AbstractEvent): Buffer;

  /**
   *
   */
  public abstract deserialize(buffer: Buffer): AbstractEvent;

  /**
   *
   */
  protected getEventKey(Event: Type<AbstractEvent>): string {
    const eventKey: string | undefined = Reflect.getMetadata(
      EVENT_METADATA,
      Event,
    );
    if (!eventKey) {
      throw new Error('not an event, forgot @Event("my_event")');
    }
    return eventKey;
  }

  /**
   *
   */
  protected getEventType(eventKey: string): Type<AbstractEvent> {
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

  private async registerEventTypes(): Promise<void> {
    for (const module of this.modulesContainer.values()) {
      for (const instanceWrapper of module.providers.values()) {
        const { instance } = instanceWrapper;
        if (!instance) {
          continue;
        }
        const metadataItems:
          | HandleEventMetadataItem<AbstractEvent>[]
          | undefined = Reflect.getMetadata(
          HANDLE_EVENT_METADATA,
          instance.constructor,
        );
        if (!metadataItems) {
          continue;
        }
        for (const { eventType } of metadataItems) {
          const eventKey = this.getEventKey(eventType);
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
