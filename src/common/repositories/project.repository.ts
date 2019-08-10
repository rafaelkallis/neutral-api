import { EntityRepository } from 'typeorm';

import { Project } from '../entities/project.entity';

import { BaseRepository } from './base.repository';

@EntityRepository(Project)
export class ProjectRepository extends BaseRepository<Project> {}
