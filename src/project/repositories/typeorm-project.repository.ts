import { TypeOrmRepository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { Database, InjectDatabase } from 'database';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository extends TypeOrmRepository<ProjectEntity>
  implements TypeOrmProjectRepository {
  /**
   *
   */
  public constructor(@InjectDatabase() database: Database) {
    super(database, ProjectEntity);
  }

  public async findByOwnerId(ownerId: string): Promise<ProjectEntity[]> {
    return this.getInternalRepository().find({ ownerId });
  }
}
