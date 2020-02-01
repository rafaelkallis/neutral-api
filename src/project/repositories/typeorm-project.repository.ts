import { TypeOrmRepository } from 'common';
import { ProjectEntity } from 'project/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { ProjectRepository } from 'project/repositories/project.repository';
import { ProjectModel } from 'project/project.model';
import { ProjectNotFoundException } from 'project/exceptions/project-not-found.exception';

/**
 * TypeOrm Project Repository
 */
@Injectable()
export class TypeOrmProjectRepository
  extends TypeOrmRepository<ProjectModel, ProjectEntity>
  implements ProjectRepository {
  /**
   *
   */
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, ProjectEntity);
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
  protected toModel(projectEntity: ProjectEntity): ProjectModel {
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
  protected toEntity(projectModel: ProjectModel): ProjectEntity {
    return new ProjectEntity(
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
