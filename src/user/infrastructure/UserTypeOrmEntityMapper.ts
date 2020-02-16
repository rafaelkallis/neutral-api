import { Injectable } from '@nestjs/common';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { UserModel } from 'user/domain/UserModel';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { Email } from 'user/domain/value-objects/Email';
import { Id } from 'common/domain/value-objects/Id';
import { Name } from 'user/domain/value-objects/Name';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

/**
 * User TypeOrm Repository
 */
@Injectable()
export class UserTypeOrmEntityMapperService
  implements TypeOrmEntityMapperService<UserModel, UserTypeOrmEntity> {
  /**
   *
   */
  public toModel(userEntity: UserTypeOrmEntity): UserModel {
    return new UserModel(
      Id.from(userEntity.id),
      CreatedAt.from(userEntity.createdAt),
      UpdatedAt.from(userEntity.updatedAt),
      Email.from(userEntity.email),
      Name.from(userEntity.firstName, userEntity.lastName),
      LastLoginAt.from(userEntity.lastLoginAt),
    );
  }

  /**
   *
   */
  public toEntity(userModel: UserModel): UserTypeOrmEntity {
    return new UserTypeOrmEntity(
      userModel.id.value,
      userModel.createdAt.value,
      userModel.updatedAt.value,
      userModel.email.value,
      userModel.name.first,
      userModel.name.last,
      userModel.lastLoginAt.value,
    );
  }
}
