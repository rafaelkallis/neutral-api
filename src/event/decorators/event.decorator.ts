import 'reflect-metadata';
import { EVENT_METADATA } from 'event/constants';

export function Event(eventType: string): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(EVENT_METADATA, eventType, target.constructor);
  };
}
