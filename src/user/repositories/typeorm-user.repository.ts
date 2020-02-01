import { TypeOrmRepository } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'user/entities/user.entity';
import { DatabaseClientService } from 'database';
import { UserModel } from 'user/user.model';
import { UserNotFoundException } from 'user/exceptions/user-not-found.exception';

/**
 * TypeOrm User Repository
 */
@Injectable()
export class TypeOrmUserRepository
  extends TypeOrmRepository<UserModel, UserEntity>
  implements UserRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, UserEntity);
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<UserModel[]> {
    const userEntities = await this.internalRepository
      .createQueryBuilder('user')
      .where('full_name ILIKE :fullName', { fullName: `%${fullName}%` })
      .orderBy('id', 'DESC')
      .take(10)
      .getMany();
    const userModels = userEntities.map(e => this.toModel(e));
    return userModels;
  }

  /**
   *
   */
  public async findByEmail(email: string): Promise<UserModel> {
    const userEntity = await this.internalRepository.findOne({ email });
    if (!userEntity) {
      this.throwEntityNotFoundException();
    }
    const userModel = this.toModel(userEntity);
    return userModel;
  }

  /**
   *
   */
  public async existsByEmail(email: string): Promise<boolean> {
    const userEntity = await this.internalRepository.findOne({ email });
    return Boolean(userEntity);
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new UserNotFoundException();
  }

  /**
   *
   */
  protected toModel(userEntity: UserEntity): UserModel {
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
  protected toEntity(userModel: UserModel): UserEntity {
    return new UserEntity(
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
