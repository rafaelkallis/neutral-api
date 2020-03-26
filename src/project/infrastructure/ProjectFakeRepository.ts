import { Project } from 'project/domain/Project';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';
import { Id } from 'shared/domain/value-objects/Id';

/**
 * Project Fake Repository
 */
export class ProjectFakeRepository extends MemoryRepository<Project>
  implements ProjectRepository {
  /**
   *
   */
  public async findByCreatorId(creatorId: Id): Promise<Project[]> {
    return Array.from(this.models.values()).filter((entity) =>
      entity.creatorId.equals(creatorId),
    );
  }

  public async findByRoleId(roleId: Id): Promise<Project> {
    const project = Array.from(this.models.values()).find((project) =>
      project.roles.exists(roleId),
    );
    if (!project) {
      throw new ProjectNotFoundException();
    }
    return project;
  }

  public async findByRoleAssigneeId(assigneeId: Id): Promise<Project[]> {
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
