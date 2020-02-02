import { FakeRepository } from 'common';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';

/**
 * Project Fake Repository
 */
export class ProjectFakeRepository extends FakeRepository<ProjectModel>
  implements ProjectRepository {
  /**
   *
   */
  public async findByCreatorId(creatorId: string): Promise<ProjectModel[]> {
    return Array.from(this.entities.values()).filter(
      entity => entity.creatorId === creatorId,
    );
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new ProjectNotFoundException();
  }
}
