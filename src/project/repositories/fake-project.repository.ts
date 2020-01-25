import { FakeRepository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';
import { ProjectRepository } from 'project/repositories/project.repository';

/**
 * Fake Project Repository
 */
export class FakeProjectRepository extends FakeRepository<ProjectEntity>
  implements ProjectRepository {
  /**
   *
   */
  public async findByOwnerId(ownerId: string): Promise<ProjectEntity[]> {
    return Array.from(this.entities.values()).filter(
      entity => entity.ownerId === ownerId,
    );
  }
}
