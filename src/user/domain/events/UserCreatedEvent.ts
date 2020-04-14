import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Id } from 'shared/domain/value-objects/Id';

/**
 * User Created Event
 */
@DomainEventKey('user.created')
export class UserCreatedEvent extends DomainEvent {
  public readonly userId: Id;

  constructor(userId: Id) {
    super();
    this.userId = userId;
  }
}
