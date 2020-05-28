import { Injectable } from '@nestjs/common';
import { Repository } from 'shared/domain/Repository';
import { ReadonlyProject } from 'project/domain/project/Project';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { ProjectRepositoryStrategy } from './ProjectRepositoryStrategy';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';

@Injectable()
export class ProjectRepository extends Repository<ProjectId, ReadonlyProject> {
  protected strategy: ProjectRepositoryStrategy;

  public constructor(
    unitOfWork: UnitOfWork,
    strategy: ProjectRepositoryStrategy,
  ) {
    super(unitOfWork, strategy);
    this.strategy = strategy;
  }
  /**
   *
   */
  public async findByCreatorId(creatorId: UserId): Promise<ReadonlyProject[]> {
    const projects = await this.strategy.findByCreatorId(creatorId);
    this.loadedModels(projects);
    return projects;
  }

  /**
   *
   */
  public async findByRoleAssigneeId(
    assigneeId: UserId,
  ): Promise<ReadonlyProject[]> {
    const projects = await this.strategy.findByRoleAssigneeId(assigneeId);
    this.loadedModels(projects);
    return projects;
  }
}
