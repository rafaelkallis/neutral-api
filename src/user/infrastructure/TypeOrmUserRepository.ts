import { UserRepository } from 'user/domain/UserRepository';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Repository } from 'shared/domain/Repository';
import { Injectable } from '@nestjs/common';

/**
 * TypeOrm User Repository
 */
@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  private readonly typeOrmClient: TypeOrmClient;
  private readonly typeOrmRepository: Repository<UserId, User>;
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper, typeOrmClient: TypeOrmClient) {
    super();
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

  public async findByIds(ids: UserId[]): Promise<(User | undefined)[]> {
    return this.typeOrmRepository.findByIds(ids);
  }

  public async exists(id: UserId): Promise<boolean> {
    return this.typeOrmRepository.exists(id);
  }

  protected async doPersist(...users: User[]): Promise<void> {
    await this.typeOrmRepository.persist(...users);
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
  public async findByEmail(email: Email): Promise<User | undefined> {
    const userEntity = await this.typeOrmClient.entityManager
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
    const userEntity = await this.typeOrmClient.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    return Boolean(userEntity);
  }
}
