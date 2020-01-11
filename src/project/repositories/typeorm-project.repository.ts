import { TypeOrmRepository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE } from 'database';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository extends TypeOrmRepository<ProjectEntity>
  implements TypeOrmProjectRepository {
  /**
   *
   */
  public constructor(@Inject(DATABASE) database: Database) {
    super(database, ProjectEntity);
  }
}
