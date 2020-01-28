import { Type } from '@nestjs/common';
import { AbstractEvent } from 'event/abstract.event';

/**
 * HandleEvent Metadata Item
 */
export class HandleEventMetadataItem<TEvent extends AbstractEvent> {
  public readonly eventType: Type<TEvent>;
  public readonly propertyKey: string | symbol;

  public constructor(eventType: Type<TEvent>, propertyKey: string | symbol) {
    this.eventType = eventType;
    this.propertyKey = propertyKey;
  }
}
