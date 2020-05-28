import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Injectable, Type } from '@nestjs/common';
import { UserRepositoryStrategy } from 'user/domain/UserRepositoryStrategy';
import { TypeOrmRepositoryStrategy } from 'shared/typeorm/TypeOrmRepositoryStrategy';
import { UserId } from 'user/domain/value-objects/UserId';

@Injectable()
export class TypeOrmUserRepositoryStrategy
  extends TypeOrmRepositoryStrategy<UserId, User, UserTypeOrmEntity>
  implements UserRepositoryStrategy {
  public constructor(objectMapper: ObjectMapper, typeOrmClient: TypeOrmClient) {
    super(typeOrmClient.entityManager, objectMapper);
  }

  protected getModelType(): Type<User> {
    return User;
  }

  protected getEntityType(): Type<UserTypeOrmEntity> {
    return UserTypeOrmEntity;
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<User[]> {
    const userEntities = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .createQueryBuilder('user')
      .where('full_name ILIKE :fullName', { fullName: `%${fullName}%` })
      .orderBy('id', 'DESC')
      .take(10)
      .getMany();
    return this.objectMapper.mapArray(userEntities, User);
  }

  /**
   *
   */
  public async findByEmail(email: Email): Promise<User | undefined> {
    const userEntity = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    if (!userEntity) {
      return undefined;
    }
    return this.objectMapper.map(userEntity, User);
  }

  /**
   *
   */
  // TODO really needed?
  public async existsByEmail(email: Email): Promise<boolean> {
    const userEntity = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    return Boolean(userEntity);
  }
}
