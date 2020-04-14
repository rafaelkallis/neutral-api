import { Injectable, Type } from '@nestjs/common';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import {
  DomainEventBroker,
  DomainEventHandler,
} from 'shared/domain-event/application/DomainEventBroker';
import { Subject, Subscription } from 'shared/domain/Observer';

/**
 * Memory Domain Event Broker
 */
@Injectable()
export class MemoryDomainEventBroker extends DomainEventBroker {
  private readonly domainEventSubjects: Map<unknown, Subject<DomainEvent>>;

  public constructor() {
    super();
    this.domainEventSubjects = new Map();
  }

  /**
   *
   */
  public async publish(...events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const domainEventSubject = this.domainEventSubjects.get(
        event.constructor,
      );
      if (!domainEventSubject) {
        continue;
      }
      await domainEventSubject.handle(event);
    }
  }

  /**
   *
   */
  public async subscribe<T extends DomainEvent>(
    domainEventType: Type<T>,
    domainEventHandler: DomainEventHandler<T>,
  ): Promise<Subscription> {
    let domainEventSubject = this.domainEventSubjects.get(domainEventType) as
      | Subject<T>
      | undefined;
    if (!domainEventSubject) {
      domainEventSubject = new Subject();
      this.domainEventSubjects.set(domainEventType, domainEventSubject);
    }
    return domainEventSubject.subscribe({
      handle: async (domainEvent) => {
        domainEventHandler.handleDomainEvent(domainEvent);
      },
    });
  }
}
