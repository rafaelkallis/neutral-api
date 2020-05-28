import { Injectable } from '@nestjs/common';
import { ReadonlyProject } from 'project/domain/project/Project';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { RepositoryStrategy } from 'shared/domain/RepositoryStrategy';

@Injectable()
export abstract class ProjectRepositoryStrategy extends RepositoryStrategy<
  ProjectId,
  ReadonlyProject
> {
  public abstract findByCreatorId(
    creatorId: UserId,
  ): Promise<ReadonlyProject[]>;
  public abstract findByRoleAssigneeId(
    assigneeId: UserId,
  ): Promise<ReadonlyProject[]>;
}
