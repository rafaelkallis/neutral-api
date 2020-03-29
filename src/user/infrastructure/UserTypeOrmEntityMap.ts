import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Id } from 'shared/domain/value-objects/Id';
import { Name } from 'user/domain/value-objects/Name';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { ModelMap, AbstractModelMap } from 'shared/model-mapper/ModelMap';

@ModelMap(User, UserTypeOrmEntity)
export class UserTypeOrmEntityMap extends AbstractModelMap<
  User,
  UserTypeOrmEntity
> {
  protected innerMap(model: User): UserTypeOrmEntity {
    return new UserTypeOrmEntity(
      model.id.value,
      model.createdAt.value,
      model.updatedAt.value,
      model.email.value,
      model.name.first,
      model.name.last,
      model.avatar ? model.avatar.value : null,
      model.lastLoginAt.value,
    );
  }
}

@ModelMap(UserTypeOrmEntity, User)
export class ReverseUserTypeOrmEntityMap extends AbstractModelMap<
  UserTypeOrmEntity,
  User
> {
  protected innerMap(entity: UserTypeOrmEntity): User {
    return new User(
      Id.from(entity.id),
      CreatedAt.from(entity.createdAt),
      UpdatedAt.from(entity.updatedAt),
      Email.from(entity.email),
      Name.from(entity.firstName, entity.lastName),
      entity.avatar ? Avatar.from(entity.avatar) : null,
      LastLoginAt.from(entity.lastLoginAt),
    );
  }
}
