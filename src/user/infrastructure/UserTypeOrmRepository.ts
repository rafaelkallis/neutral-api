import { Injectable } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { DatabaseClientService } from 'database';
import { UserModel } from 'user/domain/UserModel';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { UserTypeOrmEntityMapperService } from 'user/infrastructure/UserTypeOrmEntityMapper';
import { SimpleTypeOrmRepository } from 'common/infrastructure/SimpleTypeOrmRepository';
import { ObjectType } from 'typeorm';
import { Email } from 'user/domain/value-objects/Email';

/**
 * TypeOrm User Repository
 */
@Injectable()
export class UserTypeOrmRepository
  extends SimpleTypeOrmRepository<UserModel, UserTypeOrmEntity>
  implements UserRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    userTypeOrmEntityMapper: UserTypeOrmEntityMapperService,
  ) {
    super(databaseClient, userTypeOrmEntityMapper);
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<UserModel[]> {
    const userEntities = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .createQueryBuilder('user')
      .where('full_name ILIKE :fullName', { fullName: `%${fullName}%` })
      .orderBy('id', 'DESC')
      .take(10)
      .getMany();
    const userModels = userEntities.map(e => this.entityMapper.toModel(e));
    return userModels;
  }

  /**
   *
   */
  public async findByEmail(email: Email): Promise<UserModel> {
    const userEntity = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    if (!userEntity) {
      this.throwEntityNotFoundException();
    }
    const userModel = this.entityMapper.toModel(userEntity);
    return userModel;
  }

  /**
   *
   */
  public async existsByEmail(email: Email): Promise<boolean> {
    const userEntity = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
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
  protected getEntityType(): ObjectType<UserTypeOrmEntity> {
    return UserTypeOrmEntity;
  }
}
