import { Project } from 'project/domain/Project';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';

export class MemoryProjectRepository implements ProjectRepository {
  private readonly memoryRepository: MemoryRepository<ProjectId, Project>;

  public constructor() {
    this.memoryRepository = new MemoryRepository();
  }

  public async findPage(afterId?: ProjectId | undefined): Promise<Project[]> {
    return this.memoryRepository.findPage(afterId);
  }

  public async findById(id: ProjectId): Promise<Project | undefined> {
    return this.memoryRepository.findById(id);
  }

  public async findByIds(ids: ProjectId[]): Promise<(Project | undefined)[]> {
    return this.memoryRepository.findByIds(ids);
  }

  public async exists(id: ProjectId): Promise<boolean> {
    return this.memoryRepository.exists(id);
  }

  public async persist(...models: Project[]): Promise<void> {
    return this.memoryRepository.persist(...models);
  }

  public async delete(...models: Project[]): Promise<void> {
    return this.memoryRepository.delete(...models);
  }

  /**
   *
   */
  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    return this.memoryRepository
      .getModels()
      .filter((project) => project.creatorId.equals(creatorId));
  }

  public async findByRoleId(roleId: RoleId): Promise<Project | undefined> {
    return this.memoryRepository
      .getModels()
      .find((project) => project.roles.exists(roleId));
  }

  public async findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]> {
    const projects = this.memoryRepository
      .getModels()
      .filter((project) => project.roles.anyAssignedToUser(assigneeId));
    return projects;
  }
}
