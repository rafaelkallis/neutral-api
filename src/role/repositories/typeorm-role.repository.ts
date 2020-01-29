import { TypeOrmRepository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';

/**
 * TypeOrm Role Repository
 */
@Injectable()
export class TypeOrmRoleRepository extends TypeOrmRepository<RoleEntity> {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, RoleEntity);
  }

  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleEntity[]> {
    return await this.internalRepository.find({ projectId });
  }

  /**
   *
   */
  public async findByAssigneeId(assigneeId: string): Promise<RoleEntity[]> {
    return await this.internalRepository.find({ assigneeId });
  }
}
