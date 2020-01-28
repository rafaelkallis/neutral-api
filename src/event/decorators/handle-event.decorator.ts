import 'reflect-metadata';
import { HANDLE_EVENT_METADATA } from 'event/constants';
import { AbstractEvent } from 'event/abstract.event';
import { HandleEventMetadataItem } from 'event/services/handle-event-metadata-item';
import { Type } from '@nestjs/common';

/**
 *
 */
export function HandleEvent<TEvent extends AbstractEvent>(
  eventType: Type<TEvent>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    let existingHandleEventMetadataItems:
      | HandleEventMetadataItem<AbstractEvent>[]
      | undefined = Reflect.getMetadata(
      HANDLE_EVENT_METADATA,
      target.constructor,
    );
    if (!existingHandleEventMetadataItems) {
      existingHandleEventMetadataItems = [];
    }
    const newHandleEventMetadataItem = new HandleEventMetadataItem(
      eventType,
      propertyKey,
    );
    Reflect.defineMetadata(
      HANDLE_EVENT_METADATA,
      [...existingHandleEventMetadataItems, newHandleEventMetadataItem],
      target.constructor,
    );
  };
}
