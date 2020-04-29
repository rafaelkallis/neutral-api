import { Project } from 'project/domain/Project';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { Role } from 'project/domain/Role';
import { PeerReview } from 'project/domain/PeerReview';
import { RoleCollection } from 'project/domain/RoleCollection';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { PeerReviewId } from 'project/domain/value-objects/PeerReviewId';
import { Injectable, Type } from '@nestjs/common';
import {
  getProjectState,
  getProjectStateValue,
} from 'project/domain/value-objects/states/ProjectStateValue';
import { ReviewTopicCollection } from 'project/domain/ReviewTopicCollection';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ReviewTopicTypeOrmEntity } from './ReviewTopicTypeOrmEntity';
import { ReviewTopic } from 'project/domain/ReviewTopic';

@Injectable()
export class ProjectTypeOrmEntityMap extends ObjectMap<
  Project,
  ProjectTypeOrmEntity
> {
  private static readonly rolesSentinel: ReadonlyArray<RoleTypeOrmEntity> = [];
  private static readonly reviewTopicsSentinel: ReadonlyArray<
    ReviewTopicTypeOrmEntity
  > = [];

  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected doMap(projectModel: Project): ProjectTypeOrmEntity {
    const peerReviewEntities: PeerReviewTypeOrmEntity[] = [];
    const projectEntity = new ProjectTypeOrmEntity(
      projectModel.id.value,
      projectModel.createdAt.value,
      projectModel.updatedAt.value,
      projectModel.title.value,
      projectModel.description.value,
      projectModel.creatorId.value,
      getProjectStateValue(projectModel.state),
      projectModel.consensuality ? projectModel.consensuality.value : null,
      projectModel.contributionVisibility.value,
      projectModel.skipManagerReview.value,
      ProjectTypeOrmEntityMap.rolesSentinel,
      peerReviewEntities,
      ProjectTypeOrmEntityMap.reviewTopicsSentinel,
    );
    projectEntity.roles = Array.from(
      this.objectMapper.mapIterable(projectModel.roles, RoleTypeOrmEntity, {
        project: projectEntity,
      }),
    );
    for (const peerReview of projectModel.peerReviews) {
      peerReviewEntities.push(
        new PeerReviewTypeOrmEntity(
          peerReview.id.value,
          peerReview.createdAt.value,
          peerReview.updatedAt.value,
          projectEntity,
          peerReview.senderRoleId.value,
          peerReview.receiverRoleId.value,
          peerReview.score.value,
        ),
      );
    }
    projectEntity.reviewTopics = Array.from(
      this.objectMapper.mapIterable(
        projectModel.reviewTopics,
        ReviewTopicTypeOrmEntity,
        { project: projectEntity },
      ),
    );
    return projectEntity;
  }

  public getSourceType(): Type<Project> {
    return Project;
  }

  public getTargetType(): Type<ProjectTypeOrmEntity> {
    return ProjectTypeOrmEntity;
  }
}

@Injectable()
export class ReverseProjectTypeOrmEntityMap extends ObjectMap<
  ProjectTypeOrmEntity,
  Project
> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected doMap(projectEntity: ProjectTypeOrmEntity): Project {
    const roles = new RoleCollection(
      this.objectMapper.mapArray(projectEntity.roles, Role),
    );
    const peerReviews = new PeerReviewCollection(
      projectEntity.peerReviews.map(
        (peerReviewEntity) =>
          new PeerReview(
            PeerReviewId.from(peerReviewEntity.id),
            CreatedAt.from(peerReviewEntity.createdAt),
            UpdatedAt.from(peerReviewEntity.updatedAt),
            RoleId.from(peerReviewEntity.senderRoleId),
            RoleId.from(peerReviewEntity.receiverRoleId),
            PeerReviewScore.from(peerReviewEntity.score),
          ),
      ),
    );
    const reviewTopics = new ReviewTopicCollection(
      this.objectMapper.mapArray(projectEntity.reviewTopics, ReviewTopic),
    );
    return new Project(
      ProjectId.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      UserId.from(projectEntity.creatorId),
      getProjectState(projectEntity.state),
      projectEntity.consensuality
        ? Consensuality.from(projectEntity.consensuality)
        : null,
      ContributionVisibility.from(projectEntity.contributionVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      roles,
      peerReviews,
      reviewTopics,
    );
  }

  public getSourceType(): Type<ProjectTypeOrmEntity> {
    return ProjectTypeOrmEntity;
  }

  public getTargetType(): Type<Project> {
    return Project;
  }
}
