import { FakeRepository } from 'common';
import { ProjectModel } from 'project/project.model';
import { ProjectRepository } from 'project/repositories/project.repository';
import { ProjectNotFoundException } from 'project/exceptions/project-not-found.exception';

/**
 * Fake Project Repository
 */
export class FakeProjectRepository extends FakeRepository<ProjectModel>
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
