import { TypeOrmRepository, EntityNotFoundException } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'user/entities/user.entity';
import { DatabaseService, InjectDatabase } from 'database';

/**
 * TypeOrm User Repository
 */
@Injectable()
export class TypeOrmUserRepository extends TypeOrmRepository<UserEntity>
  implements UserRepository {
  /**
   *
   */
  public constructor(@InjectDatabase() database: DatabaseService) {
    super(database, UserEntity);
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<UserEntity[]> {
    return this.getInternalRepository()
      .createQueryBuilder('user')
      .where('full_name ILIKE :fullName', { fullName: `%${fullName}%` })
      .orderBy('id', 'DESC')
      .take(10)
      .getMany();
  }

  /**
   *
   */
  public async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.getInternalRepository().findOne({ email });
    if (!user) {
      throw new EntityNotFoundException();
    }
    return user;
  }

  /**
   *
   */
  public async existsByEmail(email: string): Promise<boolean> {
    const user = await this.getInternalRepository().findOne({ email });
    return Boolean(user);
  }
}
