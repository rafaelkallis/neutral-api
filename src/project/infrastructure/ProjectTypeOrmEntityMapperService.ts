import { Injectable } from '@nestjs/common';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { RoleModel } from 'role';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';

/**
 * Project TypeOrm Entity Mapper
 */
@Injectable()
export class ProjectTypeOrmEntityMapperService {
  /**
   *
   */
  public toModel(
    projectEntity: ProjectTypeOrmEntity,
    roleEntities: RoleTypeOrmEntity[],
  ): ProjectModel {
    const roles = roleEntities.map(
      roleEntity =>
        new RoleModel(
          Id.from(roleEntity.id),
          CreatedAt.from(roleEntity.createdAt),
          UpdatedAt.from(roleEntity.updatedAt),
          Id.from(roleEntity.projectId),
          roleEntity.assigneeId ? Id.from(roleEntity.assigneeId) : null,
          roleEntity.title,
          roleEntity.description,
          roleEntity.contribution,
          roleEntity.hasSubmittedPeerReviews,
        ),
    );
    return new ProjectModel(
      Id.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      Id.from(projectEntity.creatorId),
      ProjectState.from(projectEntity.state),
      projectEntity.consensuality
        ? Consensuality.from(projectEntity.consensuality)
        : null,
      ContributionVisibility.from(projectEntity.contributionVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      roles,
    );
  }

  /**
   *
   */
  public toEntity(projectModel: ProjectModel): ProjectTypeOrmEntity {
    return new ProjectTypeOrmEntity(
      projectModel.id.value,
      projectModel.createdAt.value,
      projectModel.updatedAt.value,
      projectModel.title.value,
      projectModel.description.value,
      projectModel.creatorId.value,
      projectModel.state.toValue(),
      projectModel.consensuality ? projectModel.consensuality.value : null,
      projectModel.contributionVisibility.toValue(),
      projectModel.skipManagerReview.toValue(),
    );
  }
}
