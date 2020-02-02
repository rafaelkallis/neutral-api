import { Injectable } from '@nestjs/common';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { UserModel } from 'user/domain/UserModel';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';

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
      userEntity.id,
      userEntity.createdAt,
      userEntity.updatedAt,
      userEntity.email,
      userEntity.firstName,
      userEntity.lastName,
      userEntity.lastLoginAt,
    );
  }

  /**
   *
   */
  public toEntity(userModel: UserModel): UserTypeOrmEntity {
    return new UserTypeOrmEntity(
      userModel.id,
      userModel.createdAt,
      userModel.updatedAt,
      userModel.email,
      userModel.firstName,
      userModel.lastName,
      userModel.lastLoginAt,
    );
  }
}
