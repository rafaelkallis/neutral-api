import { DomainEvent } from 'event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { Avatar } from 'user/domain/value-objects/Avatar';

/**
 * User Avatar Updated Event
 */
export class UserAvatarUpdatedEvent extends DomainEvent {
  public readonly user: User;
  public readonly newAvatar: Avatar | null;
  public readonly oldAvatar: Avatar | null;

  public constructor(
    user: User,
    newAvatar: Avatar | null,
    oldAvatar: Avatar | null,
  ) {
    super();
    this.user = user;
    this.newAvatar = newAvatar;
    this.oldAvatar = oldAvatar;
  }
}
