import 'reflect-metadata';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

const DOMAIN_EVENT_KEY = Symbol('DOMAIN_EVENT_KEY');

export function getDomainEventKey(target: Function): string | undefined {
  return Reflect.getMetadata(DOMAIN_EVENT_KEY, target);
}

export function DomainEventKey<T extends DomainEvent>(
  key: string,
): ClassDecorator {
  return (target: Function): void => {
    if (!(target.prototype instanceof DomainEvent)) {
      throw new Error(
        `${target.name} is not a domain event, did you extend ${DomainEvent.name} ?`,
      );
    }
    Reflect.defineMetadata(DOMAIN_EVENT_KEY, key, target);
  };
}
