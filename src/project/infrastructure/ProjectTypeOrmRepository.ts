import { TypeOrmRepository } from 'common';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { ProjectTypeOrmEntityMapperService } from 'project/infrastructure/ProjectTypeOrmEntityMapperService';

/**
 * Project TypeOrm Repository
 */
@Injectable()
export class ProjectTypeOrmRepository
  extends TypeOrmRepository<ProjectModel, ProjectTypeOrmEntity>
  implements ProjectRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    projectEntityMapper: ProjectTypeOrmEntityMapperService,
  ) {
    super(databaseClient, ProjectTypeOrmEntity, projectEntityMapper);
  }

  public async findByCreatorId(creatorId: string): Promise<ProjectModel[]> {
    const projectEntities = await this.internalRepository.find({
      creatorId: creatorId,
    });
    const projectModels = projectEntities.map(p =>
      this.entityMapper.toModel(p),
    );
    return projectModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new ProjectNotFoundException();
  }
}
