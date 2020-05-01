import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * User Activated Event
 */
@DomainEventKey('user.activated')
export class UserActivatedEvent extends DomainEvent {
  public readonly userId: UserId;

  constructor(userId: UserId) {
    super();
    this.userId = userId;
  }
}
