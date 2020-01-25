import { TypeOrmRepository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { Database, InjectDatabase } from 'database';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository extends TypeOrmRepository<RoleEntity> {
  /**
   *
   */
  public constructor(@InjectDatabase() database: Database) {
    super(database, RoleEntity);
  }

  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleEntity[]> {
    return await this.getInternalRepository().find({ projectId });
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: string): Promise<RoleEntity[]> {
    return await this.getInternalRepository().find({ assigneeId });
  }
}
