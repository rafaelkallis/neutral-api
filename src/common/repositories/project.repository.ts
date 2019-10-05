import { EntityRepository } from 'typeorm';

import { ProjectEntity } from '../entities/project.entity';

import { BaseRepository } from './base.repository';

/**
 * Project Repository
 */
@EntityRepository(ProjectEntity)
export class ProjectRepository extends BaseRepository<ProjectEntity> {}
