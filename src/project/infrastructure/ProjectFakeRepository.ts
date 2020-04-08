import { Project } from 'project/domain/Project';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Project Fake Repository
 */
export class ProjectFakeRepository extends MemoryRepository<ProjectId, Project>
  implements ProjectRepository {
  /**
   *
   */
  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    return Array.from(this.models.values()).filter((entity) =>
      entity.creatorId.equals(creatorId),
    );
  }

  public async findByRoleId(roleId: RoleId): Promise<Project> {
    const project = Array.from(this.models.values()).find((project) =>
      project.roles.exists(roleId),
    );
    if (!project) {
      throw new ProjectNotFoundException();
    }
    return project;
  }

  public async findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]> {
    const projects = Array.from(this.models.values()).filter((project) =>
      project.roles.anyAssignedToUser(assigneeId),
    );
    return projects;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new ProjectNotFoundException();
  }
}
