import { Event } from 'event/event';
import { Type } from '@nestjs/common';

/**
 *
 */
export class SagaMetadataItem<TEvent extends Event> {
  public readonly eventType: Type<TEvent>;
  public readonly propertyKey: string | symbol;

  public constructor(eventType: Type<TEvent>, propertyKey: string | symbol) {
    this.eventType = eventType;
    this.propertyKey = propertyKey;
  }
}
