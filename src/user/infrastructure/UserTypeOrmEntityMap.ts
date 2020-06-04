import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { UserId } from 'user/domain/value-objects/UserId';
import { Type, Injectable } from '@nestjs/common';
import {
  getUserState,
  getUserStateValue,
} from 'user/domain/value-objects/states/UserStateValue';

@Injectable()
export class UserTypeOrmEntityMap extends ObjectMap<User, UserTypeOrmEntity> {
  protected doMap(model: User): UserTypeOrmEntity {
    return new UserTypeOrmEntity(
      model.id.value,
      model.createdAt.value,
      model.updatedAt.value,
      model.email.value,
      model.name.first,
      model.name.last,
      model.avatar ? model.avatar.value : null,
      getUserStateValue(model.state),
      model.lastLoginAt.value,
    );
  }

  public getSourceType(): Type<User> {
    return User;
  }

  public getTargetType(): Type<UserTypeOrmEntity> {
    return UserTypeOrmEntity;
  }
}

@Injectable()
export class ReverseUserTypeOrmEntityMap extends ObjectMap<
  UserTypeOrmEntity,
  User
> {
  protected doMap(entity: UserTypeOrmEntity): User {
    return new User(
      UserId.from(entity.id),
      CreatedAt.from(entity.createdAt),
      UpdatedAt.from(entity.updatedAt),
      Email.of(entity.email),
      Name.from(entity.firstName, entity.lastName),
      entity.avatar ? Avatar.from(entity.avatar) : null,
      getUserState(entity.state),
      LastLoginAt.from(entity.lastLoginAt),
    );
  }

  public getSourceType(): Type<UserTypeOrmEntity> {
    return UserTypeOrmEntity;
  }

  public getTargetType(): Type<User> {
    return User;
  }
}
