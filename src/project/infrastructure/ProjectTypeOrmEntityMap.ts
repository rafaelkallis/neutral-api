import { Project } from 'project/domain/project/Project';
import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { RoleTypeOrmEntity } from 'project/infrastructure/RoleTypeOrmEntity';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { Role } from 'project/domain/role/Role';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { Injectable, Type } from '@nestjs/common';
import {
  getProjectState,
  getProjectStateValue,
} from 'project/domain/project/value-objects/states/ProjectStateValue';
import { ReviewTopicCollection } from 'project/domain/review-topic/ReviewTopicCollection';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ReviewTopicTypeOrmEntity } from 'project/infrastructure/ReviewTopicTypeOrmEntity';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ContributionTypeOrmEntity } from 'project/infrastructure/ContributionTypeOrmEntity';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { Contribution } from 'project/domain/contribution/Contribution';

@Injectable()
export class ProjectTypeOrmEntityMap extends ObjectMap<
  Project,
  ProjectTypeOrmEntity
> {
  private static readonly rolesSentinel: ReadonlyArray<RoleTypeOrmEntity> = [];
  private static readonly peerReviewsSentinel: ReadonlyArray<
    PeerReviewTypeOrmEntity
  > = [];
  private static readonly reviewTopicsSentinel: ReadonlyArray<
    ReviewTopicTypeOrmEntity
  > = [];
  private static readonly contributionsSentinel: ReadonlyArray<
    ContributionTypeOrmEntity
  > = [];

  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected doMap(projectModel: Project): ProjectTypeOrmEntity {
    const projectEntity = new ProjectTypeOrmEntity(
      projectModel.id.value,
      projectModel.createdAt.value,
      projectModel.updatedAt.value,
      projectModel.title.value,
      projectModel.description.value,
      projectModel.creatorId.value,
      getProjectStateValue(projectModel.state),
      projectModel.contributionVisibility.value,
      projectModel.skipManagerReview.value,
      ProjectTypeOrmEntityMap.rolesSentinel,
      ProjectTypeOrmEntityMap.peerReviewsSentinel,
      ProjectTypeOrmEntityMap.reviewTopicsSentinel,
      ProjectTypeOrmEntityMap.contributionsSentinel,
    );
    projectEntity.roles = this.objectMapper.mapArray(
      projectModel.roles.toArray(),
      RoleTypeOrmEntity,
      {
        project: projectEntity,
      },
    );
    projectEntity.peerReviews = this.objectMapper.mapArray(
      projectModel.peerReviews.toArray(),
      PeerReviewTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.reviewTopics = this.objectMapper.mapArray(
      projectModel.reviewTopics.toArray(),
      ReviewTopicTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.contributions = this.objectMapper.mapArray(
      projectModel.contributions.toArray(),
      ContributionTypeOrmEntity,
      { project: projectEntity },
    );
    return projectEntity;
  }

  public getSourceClass(): Type<Project> {
    return Project;
  }

  public getTargetClass(): Type<ProjectTypeOrmEntity> {
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
      this.objectMapper.mapArray(projectEntity.peerReviews, PeerReview),
    );
    const reviewTopics = new ReviewTopicCollection(
      this.objectMapper.mapArray(projectEntity.reviewTopics, ReviewTopic),
    );
    const contributions = new ContributionCollection(
      this.objectMapper.mapArray(projectEntity.contributions, Contribution),
    );
    return new Project(
      ProjectId.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      UserId.from(projectEntity.creatorId),
      getProjectState(projectEntity.state),
      ContributionVisibility.from(projectEntity.contributionVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      roles,
      peerReviews,
      reviewTopics,
      contributions,
    );
  }

  public getSourceClass(): Type<ProjectTypeOrmEntity> {
    return ProjectTypeOrmEntity;
  }

  public getTargetClass(): Type<Project> {
    return Project;
  }
}
