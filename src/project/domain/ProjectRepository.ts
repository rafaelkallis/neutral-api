import { Repository } from 'shared/domain/Repository';
import { ReadonlyProject } from 'project/domain/Project';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { RoleId } from 'project/domain/value-objects/RoleId';
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
  public abstract findByRoleId(
    roleId: RoleId,
  ): Promise<ReadonlyProject | undefined>;

  /**
   *
   */
  public abstract findByRoleAssigneeId(
    assigneeId: UserId,
  ): Promise<ReadonlyProject[]>;
}
