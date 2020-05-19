import { Project } from 'project/domain/project/Project';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { MemoryRepository } from 'shared/infrastructure/MemoryRepository';

export class MemoryProjectRepository extends ProjectRepository {
  private readonly memoryRepository: MemoryRepository<ProjectId, Project>;

  public constructor() {
    super();
    this.memoryRepository = MemoryRepository.create();
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

  protected async doPersist(...models: Project[]): Promise<void> {
    return this.memoryRepository.persist(...models);
  }

  /**
   *
   */
  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    const results = this.memoryRepository
      .getModels()
      .filter((project) => project.creatorId.equals(creatorId));
    return Promise.resolve(results);
  }

  public async findByRoleId(roleId: RoleId): Promise<Project | undefined> {
    const results = this.memoryRepository
      .getModels()
      .find((project) => project.roles.contains(roleId));
    return Promise.resolve(results);
  }

  public async findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]> {
    const results = this.memoryRepository
      .getModels()
      .filter((project) => project.roles.isAnyAssignedToUser(assigneeId));
    return Promise.resolve(results);
  }
}
