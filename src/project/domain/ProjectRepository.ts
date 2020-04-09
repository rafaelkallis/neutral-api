import { Repository } from 'shared/domain/Repository';
import { Project } from 'project/domain/Project';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { Optional } from 'shared/domain/Optional';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Project Repository
 */
export abstract class ProjectRepository extends Repository<ProjectId, Project> {
  /**
   *
   */
  public abstract findByCreatorId(creatorId: UserId): Promise<Project[]>;

  /**
   *
   */
  public abstract findByRoleId(roleId: RoleId): Promise<Optional<Project>>;

  /**
   *
   */
  public abstract findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]>;
}
