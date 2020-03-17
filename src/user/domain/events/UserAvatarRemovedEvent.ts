import { DomainEvent } from 'event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { Avatar } from 'user/domain/value-objects/Avatar';

/**
 * User Avatar Removed Event
 */
export class UserAvatarRemovedEvent extends DomainEvent {
  public readonly user: User;
  public readonly removedAvatar: Avatar;

  public constructor(user: User, removedAvatar: Avatar) {
    super();
    this.user = user;
    this.removedAvatar = removedAvatar;
  }
}
