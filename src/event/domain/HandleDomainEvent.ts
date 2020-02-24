import { DomainEvent } from 'event/domain/DomainEvent';
import { Type } from '@nestjs/common';

export const HANDLE_DOMAIN_EVENT_METADATA = Symbol(
  'DOMAIN_EVENT_HANDLER_METADATA',
);

/**
 * Handle Domain Event Metadata Item
 */
export class HandleDomainEventMetadataItem<TEvent extends DomainEvent> {
  public readonly eventType: Type<TEvent>;
  public readonly propertyKey: string | symbol;

  public constructor(eventType: Type<TEvent>, propertyKey: string | symbol) {
    this.eventType = eventType;
    this.propertyKey = propertyKey;
  }
}

/**
 *
 */
export function getHandleDomainEventMetadataItems<TEvent extends DomainEvent>(
  target: object,
): ReadonlyArray<HandleDomainEventMetadataItem<TEvent>> {
  let metadataItems:
    | HandleDomainEventMetadataItem<TEvent>[]
    | undefined = Reflect.getMetadata(
    HANDLE_DOMAIN_EVENT_METADATA,
    target.constructor,
  );
  if (!metadataItems?.length) {
    metadataItems = [];
  }
  return metadataItems;
}

/**
 * Handle Domain Event
 */
export function HandleDomainEvent<TEvent extends DomainEvent>(
  eventType: Type<TEvent>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (!(eventType.prototype instanceof DomainEvent)) {
      throw new TypeError(
        `${eventType.name} is not a domain event, did you extend @${DomainEvent.name}?`,
      );
    }
    const existingMetadataItems = getHandleDomainEventMetadataItems(target);
    const newMetadataItem = new HandleDomainEventMetadataItem(
      eventType,
      propertyKey,
    );
    Reflect.defineMetadata(
      HANDLE_DOMAIN_EVENT_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
  };
}
