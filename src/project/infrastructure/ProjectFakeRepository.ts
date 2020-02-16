import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { MemoryRepository } from 'common/infrastructure/MemoryRepository';
import { Id } from 'common/domain/value-objects/Id';

/**
 * Project Fake Repository
 */
export class ProjectFakeRepository extends MemoryRepository<ProjectModel>
  implements ProjectRepository {
  /**
   *
   */
  public async findByCreatorId(creatorId: Id): Promise<ProjectModel[]> {
    return Array.from(this.models.values()).filter(entity =>
      entity.creatorId.equals(creatorId),
    );
  }

  public async findByRoleId(roleId: Id): Promise<ProjectModel> {
    throw new Error('not implemented');
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new ProjectNotFoundException();
  }
}
