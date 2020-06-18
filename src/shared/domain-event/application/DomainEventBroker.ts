import { Type, Logger } from '@nestjs/common';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Observer, Subscription } from 'shared/domain/Observer';

export abstract class DomainEventBroker {
  protected readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(DomainEventBroker.name, true);
  }

  public abstract publish(...domainEvents: DomainEvent[]): Promise<void>;

  public abstract subscribe<T extends DomainEvent>(
    domainEvent: Type<T>,
    domainEventHandler: DomainEventObserver<T>,
  ): Promise<Subscription>;
}

/**
 * Domain Event Handler
 */
export interface DomainEventObserver<T extends DomainEvent>
  extends Observer<T> {
  key: string;
}
