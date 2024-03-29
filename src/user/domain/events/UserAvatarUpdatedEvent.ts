import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { User } from 'user/domain/User';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';

/**
 * User Avatar Updated Event
 */
@DomainEventKey('user.avatar_updated')
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
