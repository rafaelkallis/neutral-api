import { Repository } from 'common';
import { ProjectModel } from 'project/domain/ProjectModel';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

/**
 * Project Repository
 */
export interface ProjectRepository extends Repository<ProjectModel> {
  /**
   *
   */
  findByCreatorId(creatorId: string): Promise<ProjectModel[]>;
}
