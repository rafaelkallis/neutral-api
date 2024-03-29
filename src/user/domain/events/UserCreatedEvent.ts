import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * User Created Event
 */
@DomainEventKey('user.created')
export class UserCreatedEvent extends DomainEvent {
  public readonly userId: UserId;

  constructor(userId: UserId) {
    super();
    this.userId = userId;
  }
}
