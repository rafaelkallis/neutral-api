import { EntityRepository } from 'typeorm';

import { ProjectEntity } from '../entities/project.entity';

import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Project Repository
 */
@EntityRepository(ProjectEntity)
export class ProjectRepository extends BaseRepository<ProjectEntity> {}
