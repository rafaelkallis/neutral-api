import { Type } from '@nestjs/common';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Class } from 'shared/domain/Class';

const DOMAIN_EVENT_HANDLER_METADATA = Symbol('DOMAIN_EVENT_HANDLER_METADATA');

/**
 * Domain Event Handler Metadata Item
 */
export class DomainEventHandlerMetadataItem<T extends DomainEvent> {
  public readonly domainEventType: Type<T>;
  public readonly servicePropertyKey: string | symbol;
  public readonly handlerKey: string;

  public constructor(
    domainEventType: Type<T>,
    servicePropertyKey: string | symbol,
    handlerKey: string,
  ) {
    this.domainEventType = domainEventType;
    this.servicePropertyKey = servicePropertyKey;
    this.handlerKey = handlerKey;
  }
}

const domainEventHandlerRegistry: Set<Class<object>> = new Set();

export function getDomainEventHandlerClasses(): Array<Class<object>> {
  return Array.from(domainEventHandlerRegistry.keys());
}

/**
 *
 */
export function getDomainEventHandlerMetadataItems<T extends DomainEvent>(
  target: object,
): ReadonlyArray<DomainEventHandlerMetadataItem<T>> {
  let metadataItems:
    | DomainEventHandlerMetadataItem<T>[]
    | undefined = Reflect.getMetadata(
    DOMAIN_EVENT_HANDLER_METADATA,
    target.constructor,
  );
  if (!metadataItems?.length) {
    metadataItems = [];
  }
  return metadataItems;
}

/**
 * Subscribes to domain events.
 * If multiple handlers with the same key are present, only one will receive the message.
 * @param domainEventType The domain event type to subscribe to.
 * @param handlerKey The key of the event handler.
 */
export function HandleDomainEvent<T extends DomainEvent>(
  domainEventType: Type<T>,
  handlerKey: string,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (!(domainEventType.prototype instanceof DomainEvent)) {
      throw new TypeError(
        `${domainEventType.name} is not a domain event, did you extend ${DomainEvent.name}?`,
      );
    }
    const existingMetadataItems = getDomainEventHandlerMetadataItems(target);
    const newMetadataItem = new DomainEventHandlerMetadataItem(
      domainEventType,
      propertyKey,
      handlerKey,
    );
    Reflect.defineMetadata(
      DOMAIN_EVENT_HANDLER_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
    domainEventHandlerRegistry.add(target.constructor);
  };
}
