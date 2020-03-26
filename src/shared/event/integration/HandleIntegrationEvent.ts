import { IntegrationEvent } from 'shared/event/integration/IntegrationEvent';
import { Type } from '@nestjs/common';

export const HANDLE_INTEGRATION_EVENT_METADATA = Symbol(
  'HANDLE_INTEGRATION_EVENT_METADATA',
);

/**
 * Integration Event Handler Metadata Item
 */
export class IntegrationEventHandlerMetadataItem<
  TEvent extends IntegrationEvent
> {
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
export function getHandleIntegrationEventMetadataItems(
  target: object,
): ReadonlyArray<IntegrationEventHandlerMetadataItem<IntegrationEvent>> {
  let metadataItems:
    | IntegrationEventHandlerMetadataItem<IntegrationEvent>[]
    | undefined = Reflect.getMetadata(
    HANDLE_INTEGRATION_EVENT_METADATA,
    target.constructor,
  );
  if (!metadataItems?.length) {
    metadataItems = [];
  }
  return metadataItems;
}

/**
 *
 */
export function HandleIntegrationEvent<TEvent extends IntegrationEvent>(
  eventType: Type<TEvent>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (!(eventType.prototype instanceof IntegrationEvent)) {
      throw new TypeError(
        `${eventType.name} is not an integration event, did you extend @${IntegrationEvent.name}?`,
      );
    }
    const existingMetadataItems = getHandleIntegrationEventMetadataItems(
      target,
    );
    const newMetadataItem = new IntegrationEventHandlerMetadataItem(
      eventType,
      propertyKey,
    );
    Reflect.defineMetadata(
      HANDLE_INTEGRATION_EVENT_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
  };
}
