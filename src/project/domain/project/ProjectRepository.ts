import { Repository } from 'shared/domain/Repository';
import { Project } from 'project/domain/project/Project';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Project Repository
 */
@Repository.register(Project)
export abstract class ProjectRepository extends Repository<ProjectId, Project> {
  /**
   *
   */
  public abstract findByCreatorId(creatorId: UserId): Promise<Project[]>;

  /**
   *
   */
  public abstract findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]>;
}
