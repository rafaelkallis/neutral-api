import { UserRepository } from 'user/domain/UserRepository';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Repository } from 'shared/domain/Repository';
import { Optional } from 'shared/domain/Optional';
import { Injectable } from '@nestjs/common';

/**
 * TypeOrm User Repository
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  private readonly typeOrmClient: TypeOrmClient;
  private readonly typeOrmRepository: Repository<UserId, User>;
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper, typeOrmClient: TypeOrmClient) {
    this.typeOrmClient = typeOrmClient;
    this.typeOrmRepository = typeOrmClient.createRepository(
      User,
      UserTypeOrmEntity,
    );
    this.objectMapper = objectMapper;
  }

  public async findPage(afterId?: UserId | undefined): Promise<User[]> {
    return this.typeOrmRepository.findPage(afterId);
  }

  public async findById(id: UserId): Promise<User | undefined> {
    return this.typeOrmRepository.findById(id);
  }

  public async findByIds(ids: UserId[]): Promise<Optional<User>[]> {
    return this.typeOrmRepository.findByIds(ids);
  }

  public async exists(id: UserId): Promise<boolean> {
    return await this.typeOrmRepository.exists(id);
  }

  public async persist(...users: User[]): Promise<void> {
    await this.typeOrmRepository.persist(...users);
  }

  public async delete(...users: User[]): Promise<void> {
    await this.typeOrmRepository.delete(...users);
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<User[]> {
    const userEntities = await this.typeOrmClient.entityManager
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
  public async findByEmail(email: Email): Promise<Optional<User>> {
    const userEntityOrUndefined:
      | UserTypeOrmEntity
      | undefined = await this.typeOrmClient.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    return Optional.of(userEntityOrUndefined).map((userEntity) =>
      this.objectMapper.map(userEntity, User),
    );
  }

  /**
   *
   */
  // TODO really needed?
  public async existsByEmail(email: Email): Promise<boolean> {
    const userEntity = await this.typeOrmClient.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    return Boolean(userEntity);
  }
}
