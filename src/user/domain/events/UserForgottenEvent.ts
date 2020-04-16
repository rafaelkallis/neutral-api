import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * User Forgotten Event
 */
@DomainEventKey('user.forgotten')
export class UserForgottenEvent extends DomainEvent {
  public readonly userId: UserId;

  constructor(userId: UserId) {
    super();
    this.userId = userId;
  }
}
