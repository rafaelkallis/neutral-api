import { EntityRepository } from 'typeorm';

import { BaseRepository, EntityNotFoundException } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';

/**
 * Project Repository
 */
@EntityRepository(ProjectEntity)
export class ProjectRepository extends BaseRepository<ProjectEntity> {
  /**
   *
   */
  public async findOneByRoleId(roleId: string): Promise<ProjectEntity> {
    const project = await this.createQueryBuilder('project')
      .innerJoin('roles', 'role', 'project.id = role.project_id')
      .where('role.id = :roleId', { roleId })
      .getOne();
    if (!project) {
      throw new EntityNotFoundException();
    }
    return project;
  }
}
