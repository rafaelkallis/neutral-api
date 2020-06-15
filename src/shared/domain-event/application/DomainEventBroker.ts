import { Type, Logger } from '@nestjs/common';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

export abstract class DomainEventBroker {
  protected readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(DomainEventBroker.name, true);
  }

  public abstract publish(...domainEvents: DomainEvent[]): Promise<void>;

  public abstract subscribe<T extends DomainEvent>(
    domainEvent: Type<T>,
    domainEventHandler: DomainEventHandler<T>,
  ): Promise<DomainEventSubscription>;
}

/**
 * Domain Event Handler
 */
export interface DomainEventHandler<T extends DomainEvent> {
  key: string;
  handleDomainEvent(domainEvent: T): Promise<void>;
}

/**
 * Domain Event Subscription
 */
export interface DomainEventSubscription {
  unsubscribe(): Promise<void>;
}
