import 'reflect-metadata';
import { SAGA_METADATA } from 'event/constants';
import { AbstractEvent } from 'event/abstract.event';
import { Type } from '@nestjs/common';
import { SagaMetadataItem } from 'event/services/saga-metadata-item';

export function Saga<TEvent extends AbstractEvent>(
  eventType: Type<TEvent>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    let existingSagaMetadataItems:
      | SagaMetadataItem<AbstractEvent>[]
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
