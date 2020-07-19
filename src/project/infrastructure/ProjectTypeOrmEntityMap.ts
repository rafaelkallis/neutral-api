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
import { Injectable } from '@nestjs/common';
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
@ObjectMap.register(Project, ProjectTypeOrmEntity)
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

  protected async doMap(projectModel: Project): Promise<ProjectTypeOrmEntity> {
    const projectEntity = new ProjectTypeOrmEntity(
      projectModel.id.value,
      projectModel.createdAt.value,
      projectModel.updatedAt.value,
      projectModel.title.value,
      projectModel.description.value,
      projectModel.meta,
      projectModel.creatorId.value,
      getProjectStateValue(projectModel.state),
      projectModel.contributionVisibility.asValue(),
      projectModel.skipManagerReview.value,
      ProjectTypeOrmEntityMap.rolesSentinel,
      ProjectTypeOrmEntityMap.peerReviewsSentinel,
      ProjectTypeOrmEntityMap.reviewTopicsSentinel,
      ProjectTypeOrmEntityMap.contributionsSentinel,
    );
    projectEntity.roles = await this.objectMapper.mapArray(
      projectModel.roles.toArray(),
      RoleTypeOrmEntity,
      {
        project: projectEntity,
      },
    );
    projectEntity.peerReviews = await this.objectMapper.mapArray(
      projectModel.peerReviews.toArray(),
      PeerReviewTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.reviewTopics = await this.objectMapper.mapArray(
      projectModel.reviewTopics.toArray(),
      ReviewTopicTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.contributions = await this.objectMapper.mapArray(
      projectModel.contributions.toArray(),
      ContributionTypeOrmEntity,
      { project: projectEntity },
    );
    return projectEntity;
  }
}

@Injectable()
@ObjectMap.register(ProjectTypeOrmEntity, Project)
export class ReverseProjectTypeOrmEntityMap extends ObjectMap<
  ProjectTypeOrmEntity,
  Project
> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  protected async doMap(projectEntity: ProjectTypeOrmEntity): Promise<Project> {
    const roles = new RoleCollection(
      await this.objectMapper.mapArray(projectEntity.roles, Role),
    );
    const peerReviews = PeerReviewCollection.of(
      await this.objectMapper.mapArray(projectEntity.peerReviews, PeerReview),
    );
    const reviewTopics = new ReviewTopicCollection(
      await this.objectMapper.mapArray(projectEntity.reviewTopics, ReviewTopic),
    );
    const contributions = new ContributionCollection(
      await this.objectMapper.mapArray(
        projectEntity.contributions,
        Contribution,
      ),
    );
    return Project.of(
      ProjectId.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      projectEntity.meta,
      UserId.from(projectEntity.creatorId),
      getProjectState(projectEntity.state),
      ContributionVisibility.ofValue(projectEntity.contributionVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      roles,
      peerReviews,
      reviewTopics,
      contributions,
    );
  }
}
