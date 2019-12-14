import { EntityRepository } from 'typeorm';

import { BaseRepository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';

/**
 * Project Repository
 */
@EntityRepository(ProjectEntity)
export class ProjectRepository extends BaseRepository<ProjectEntity> {}
