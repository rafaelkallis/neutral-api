import { Repository } from 'common';
import { Project } from 'project/project';
import { ProjectEntity } from 'project/entities/project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

/**
 * Project Repository
 */
export interface ProjectRepository extends Repository<Project, ProjectEntity> {}
