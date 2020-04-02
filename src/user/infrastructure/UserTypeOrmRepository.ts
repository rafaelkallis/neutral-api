import { UserRepository } from 'user/domain/UserRepository';
import { UserTypeOrmEntity } from 'user/infrastructure/UserTypeOrmEntity';
import { DatabaseClientService } from 'shared/database/DatabaseClientService';
import { User } from 'user/domain/User';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import {
  AbstractTypeOrmRepository,
  TypeOrmRepository,
} from 'shared/infrastructure/TypeOrmRepository';
import { Email } from 'user/domain/value-objects/Email';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';

/**
 * TypeOrm User Repository
 */
@TypeOrmRepository(User, UserTypeOrmEntity)
export class UserTypeOrmRepository
  extends AbstractTypeOrmRepository<User, UserTypeOrmEntity>
  implements UserRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    modelMapper: ObjectMapper,
  ) {
    super(databaseClient, modelMapper);
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
    const userModels = userEntities.map((e) => this.modelMapper.map(e, User));
    return userModels;
  }

  /**
   *
   */
  public async findByEmail(email: Email): Promise<User> {
    const userEntity = await this.entityManager
      .getRepository(UserTypeOrmEntity)
      .findOne({ email: email.value });
    if (!userEntity) {
      this.throwEntityNotFoundException();
    }
    const userModel = this.modelMapper.map(userEntity, User);
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
}
