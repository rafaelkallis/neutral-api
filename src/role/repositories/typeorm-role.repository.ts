import { TypeOrmRepository } from 'common';
import { TypeOrmRoleEntity } from 'role/entities/typeorm-role.entity';
import { Role } from 'role/role';
import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE } from 'database';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository extends TypeOrmRepository<
  Role,
  TypeOrmRoleEntity
> {
  /**
   *
   */
  public constructor(@Inject(DATABASE) database: Database) {
    super(database, TypeOrmRoleEntity);
  }

  /**
   *
   */
  public createEntity(role: Role): TypeOrmRoleEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new TypeOrmRoleEntity(
      this,
      role.id,
      createdAt,
      updatedAt,
      role.projectId,
      role.assigneeId,
      role.title,
      role.description,
      role.contribution,
      role.hasSubmittedPeerReviews,
    );
  }

  /**
   *
   */
  public async findByProjectId(
    projectId: string,
  ): Promise<TypeOrmRoleEntity[]> {
    return await this.getInternalRepository().find({ projectId });
  }
}
