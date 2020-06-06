import { Repository } from 'shared/domain/Repository';
import { ReadonlyProject } from 'project/domain/project/Project';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Project Repository
 */
export abstract class ProjectRepository extends Repository<
  ProjectId,
  ReadonlyProject
> {
  /**
   *
   */
  public abstract findByCreatorId(
    creatorId: UserId,
  ): Promise<ReadonlyProject[]>;

  /**
   *
   */
  public abstract findByRoleAssigneeId(
    assigneeId: UserId,
  ): Promise<ReadonlyProject[]>;
}
