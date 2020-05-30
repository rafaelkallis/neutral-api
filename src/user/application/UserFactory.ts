import { Injectable } from '@nestjs/common';
import { ReadonlyUser, User } from 'user/domain/User';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { AggregateRootFactory } from 'shared/application/AggregateRootFactory';
import { Email } from 'user/domain/value-objects/Email';
import { UserId } from 'user/domain/value-objects/UserId';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { Name } from 'user/domain/value-objects/Name';
import { PendingState } from 'user/domain/value-objects/states/PendingState';

export interface CreateUserOptions {
  email: Email;
}

@Injectable()
export class UserFactory extends AggregateRootFactory<
  CreateUserOptions,
  UserId,
  ReadonlyUser
> {
  protected doCreate({ email }: CreateUserOptions): ReadonlyUser {
    const userId = UserId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const name = Name.from('', '');
    const avatar = null;
    const state = PendingState.getInstance();
    const lastLoginAt = LastLoginAt.now();
    const user = new User(
      userId,
      createdAt,
      updatedAt,
      email,
      name,
      avatar,
      state,
      lastLoginAt,
    );
    user.raise(new UserCreatedEvent(user.id));
    return user;
  }
}
