import { UserRepository } from 'user/domain/UserRepository';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { TypeOrmClient } from 'shared/typeorm/TypeOrmClient';
import { Injectable } from '@nestjs/common';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  private readonly typeOrmClient: TypeOrmClient;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    unitOfWork: UnitOfWork,
    objectMapper: ObjectMapper,
    typeOrmClient: TypeOrmClient,
  ) {
    super(
      unitOfWork,
      typeOrmClient.createRepositoryStrategy(User, UserTypeOrmEntity),
    );
    this.typeOrmClient = typeOrmClient;
    this.objectMapper = objectMapper;
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
    return this.objectMapper.mapArray(userEntities, User, {
      unitOfWork: this.unitOfWork,
    });
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
    return this.objectMapper.map(userEntity, User, {
      unitOfWork: this.unitOfWork,
    });
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
