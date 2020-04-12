import { Project } from 'project/domain/Project';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { FakeRepository } from 'shared/infrastructure/FakeRepository';
import { Optional } from 'shared/domain/Optional';

export class FakeProjectRepository implements ProjectRepository {
  private readonly fakeRepository: FakeRepository<ProjectId, Project>;

  public constructor() {
    this.fakeRepository = new FakeRepository();
  }

  public async findPage(afterId?: ProjectId | undefined): Promise<Project[]> {
    return this.fakeRepository.findPage(afterId);
  }

  public async findById(id: ProjectId): Promise<Project | undefined> {
    return this.fakeRepository.findById(id);
  }

  public async findByIds(ids: ProjectId[]): Promise<(Project | undefined)[]> {
    return this.fakeRepository.findByIds(ids);
  }

  public async exists(id: ProjectId): Promise<boolean> {
    return this.fakeRepository.exists(id);
  }

  public async persist(...models: Project[]): Promise<void> {
    return this.fakeRepository.persist(...models);
  }

  public async delete(...models: Project[]): Promise<void> {
    return this.fakeRepository.delete(...models);
  }

  /**
   *
   */
  public async findByCreatorId(creatorId: UserId): Promise<Project[]> {
    return this.fakeRepository
      .getModels()
      .filter((project) => project.creatorId.equals(creatorId));
  }

  public async findByRoleId(roleId: RoleId): Promise<Optional<Project>> {
    const project = this.fakeRepository
      .getModels()
      .find((project) => project.roles.exists(roleId));
    return Optional.of(project);
  }

  public async findByRoleAssigneeId(assigneeId: UserId): Promise<Project[]> {
    const projects = this.fakeRepository
      .getModels()
      .filter((project) => project.roles.anyAssignedToUser(assigneeId));
    return projects;
  }
}
