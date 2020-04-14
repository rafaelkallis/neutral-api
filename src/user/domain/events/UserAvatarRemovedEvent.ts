import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * User Avatar Removed Event
 */
@DomainEventKey('user.avatar_removed')
export class UserAvatarRemovedEvent extends DomainEvent {
  public readonly user: User;
  public readonly removedAvatar: Avatar;

  public constructor(user: User, removedAvatar: Avatar) {
    super();
    this.user = user;
    this.removedAvatar = removedAvatar;
  }
}
