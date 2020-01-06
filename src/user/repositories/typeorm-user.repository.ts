import { TypeOrmRepository, EntityNotFoundException } from 'common';
import { UserRepository } from 'user/repositories/user.repository';
import { User } from 'user/user';
import { Injectable, Inject } from '@nestjs/common';
import { TypeOrmUserEntity } from 'user/entities/typeorm-user.entity';
import { Database, DATABASE } from 'database';

/**
 * TypeOrm User Repository
 */
@Injectable()
export class TypeOrmUserRepository
  extends TypeOrmRepository<User, TypeOrmUserEntity>
  implements UserRepository {
  /**
   *
   */
  public constructor(@Inject(DATABASE) database: Database) {
    super(database, TypeOrmUserEntity);
  }

  /**
   *
   */
  public createEntity(user: User): TypeOrmUserEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new TypeOrmUserEntity(
      this,
      user.id,
      createdAt,
      updatedAt,
      user.email,
      user.firstName,
      user.lastName,
      user.lastLoginAt,
    );
  }

  /**
   *
   */
  public async findByName(fullName: string): Promise<TypeOrmUserEntity[]> {
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
  public async findByEmail(email: string): Promise<TypeOrmUserEntity> {
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
