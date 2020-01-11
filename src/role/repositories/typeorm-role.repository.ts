import { TypeOrmRepository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE } from 'database';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository extends TypeOrmRepository<RoleEntity> {
  /**
   *
   */
  public constructor(@Inject(DATABASE) database: Database) {
    super(database, RoleEntity);
  }

  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleEntity[]> {
    return await this.getInternalRepository().find({ projectId });
  }
}
