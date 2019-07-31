import { EntityRepository, Repository } from 'typeorm';
import { Project } from './project.entity';
import { BaseRepository } from '../common';

@EntityRepository(Project)
export class ProjectRepository extends BaseRepository<Project> {}
