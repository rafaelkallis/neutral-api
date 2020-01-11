import { Repository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

/**
 * Project Repository
 */
export interface ProjectRepository extends Repository<ProjectEntity> {}
