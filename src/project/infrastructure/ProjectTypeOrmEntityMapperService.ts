import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { ProjectModel } from 'project';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';

/**
 * Project TypeOrm Entity Mapper
 */
@Injectable()
export class ProjectTypeOrmEntityMapperService
  implements TypeOrmEntityMapperService<ProjectModel, ProjectTypeOrmEntity> {
  /**
   *
   */
  public toModel(projectEntity: ProjectTypeOrmEntity): ProjectModel {
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
  public toEntity(projectModel: ProjectModel): ProjectTypeOrmEntity {
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
