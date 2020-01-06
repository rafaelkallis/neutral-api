import { TypeOrmRepository } from 'common';
import { Project } from 'project/project';
import { TypeOrmProjectEntity } from 'project/entities/typeorm-project.entity';
import { Injectable } from '@nestjs/common';
import { Database } from 'database';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository
  extends TypeOrmRepository<Project, TypeOrmProjectEntity>
  implements TypeOrmProjectRepository {
  /**
   *
   */
  public constructor(database: Database) {
    super(database, TypeOrmProjectEntity);
  }

  /**
   *
   */
  public createEntity(project: Project): TypeOrmProjectEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new TypeOrmProjectEntity(
      this,
      project.id,
      createdAt,
      updatedAt,
      project.title,
      project.description,
      project.ownerId,
      project.state,
      project.consensuality,
      project.contributionVisibility,
      project.skipManagerReview,
    );
  }
}
