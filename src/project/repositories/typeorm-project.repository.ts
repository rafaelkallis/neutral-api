import { TypeOrmRepository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { Database, InjectDatabase } from 'database';
import { ProjectRepository } from 'project/repositories/project.repository';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository extends TypeOrmRepository<ProjectEntity>
  implements ProjectRepository {
  /**
   *
   */
  public constructor(@InjectDatabase() database: Database) {
    super(database, ProjectEntity);
  }

  public async findByCreatorId(creatorId: string): Promise<ProjectEntity[]> {
    return this.getInternalRepository().find({ creatorId: creatorId });
  }
}
