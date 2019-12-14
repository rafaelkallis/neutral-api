import { EntityRepository } from 'typeorm';

import { RoleEntity } from '../entities/role.entity';

import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Role Repository
 */
@EntityRepository(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity> {
  /**
   *
   */
  public async findByProjectId(projectId: string): Promise<RoleEntity[]> {
    return this.repository.find({ projectId });
  }
}
