import 'reflect-metadata';
import { SAGA_METADATA } from 'event/constants';
import { Event } from 'event/event';
import { Type } from '@nestjs/common';
import { SagaMetadataItem } from 'event/saga-metadata-item';

export function Saga<TEvent extends Event>(
  eventType: Type<TEvent>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    let existingSagaMetadataItems:
      | SagaMetadataItem<Event>[]
      | undefined = Reflect.getMetadata(SAGA_METADATA, target.constructor);
    if (!existingSagaMetadataItems) {
      existingSagaMetadataItems = [];
    }
    const newSagaMetadataItem = new SagaMetadataItem(eventType, propertyKey);
    Reflect.defineMetadata(
      SAGA_METADATA,
      [...existingSagaMetadataItems, newSagaMetadataItem],
      target.constructor,
    );
  };
}
