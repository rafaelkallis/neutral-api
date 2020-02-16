import { Repository } from 'common/domain/Repository';
import { ProjectModel } from 'project/domain/ProjectModel';
import { Id } from 'common/domain/value-objects/Id';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

/**
 * Project Repository
 */
export interface ProjectRepository extends Repository<ProjectModel> {
  /**
   *
   */
  findByCreatorId(creatorId: Id): Promise<ProjectModel[]>;

  /**
   *
   */
  findByRoleId(roleId: Id): Promise<ProjectModel>;
}
