import { TypeOrmRepository } from 'common';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class ProjectTypeOrmRepository
  extends TypeOrmRepository<ProjectModel, ProjectTypeOrmEntity>
  implements ProjectRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, ProjectTypeOrmEntity);
  }

  public async findByCreatorId(creatorId: string): Promise<ProjectModel[]> {
    const projectEntities = await this.internalRepository.find({
      creatorId: creatorId,
    });
    const projectModels = projectEntities.map(p => this.toModel(p));
    return projectModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new ProjectNotFoundException();
  }

  /**
   *
   */
  protected toModel(projectEntity: ProjectTypeOrmEntity): ProjectModel {
    return new ProjectModel(
      projectEntity.id,
      projectEntity.createdAt,
      projectEntity.updatedAt,
      projectEntity.title,
      projectEntity.description,
      projectEntity.creatorId,
      projectEntity.state,
      projectEntity.consensuality,
      projectEntity.contributionVisibility,
      projectEntity.skipManagerReview,
    );
  }

  /**
   *
   */
  protected toEntity(projectModel: ProjectModel): ProjectTypeOrmEntity {
    return new ProjectTypeOrmEntity(
      projectModel.id,
      projectModel.createdAt,
      projectModel.updatedAt,
      projectModel.title,
      projectModel.description,
      projectModel.creatorId,
      projectModel.state,
      projectModel.consensuality,
      projectModel.contributionVisibility,
      projectModel.skipManagerReview,
    );
  }
}
