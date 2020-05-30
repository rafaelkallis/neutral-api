import { ReadonlyUser, User } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';
import {
  ReadonlyModelCollection,
  ModelCollection,
} from 'shared/domain/ModelCollection';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyUserCollection
  extends ReadonlyModelCollection<UserId, ReadonlyUser> {
  areAllActive(): boolean;
  assertAllAreActive(): void;
}

export class UserCollection extends ModelCollection<UserId, User>
  implements ReadonlyUserCollection {
  public areAllActive(): boolean {
    return this.areAll((user) => user.isActive());
  }

  public assertAllAreActive(): void {
    if (!this.areAllActive()) {
      throw new DomainException(
        'not_all_users_active',
        'Some users are not active',
      );
    }
  }
}
