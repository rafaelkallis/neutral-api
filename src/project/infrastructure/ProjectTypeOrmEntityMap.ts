import { InternalProject, Project } from 'project/domain/project/Project';
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
import { PeerReviewVisibility } from 'project/domain/project/value-objects/PeerReviewVisibility';
import { MilestoneCollection } from 'project/domain/milestone/MilestoneCollection';
import { MilestoneTypeOrmEntity } from './MilestoneTypeOrmEntity';
import { Milestone } from 'project/domain/milestone/Milestone';

@Injectable()
@ObjectMap.register(Project, ProjectTypeOrmEntity)
export class ProjectTypeOrmEntityMap extends ObjectMap<
  Project,
  ProjectTypeOrmEntity
> {
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
      projectModel.peerReviewVisibility.label,
      projectModel.skipManagerReview.value,
      [],
      [],
      [],
      [],
      [],
    );
    projectEntity.roles = await this.objectMapper.mapIterable(
      projectModel.roles,
      RoleTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.peerReviews = await this.objectMapper.mapIterable(
      projectModel.peerReviews,
      PeerReviewTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.reviewTopics = await this.objectMapper.mapIterable(
      projectModel.reviewTopics,
      ReviewTopicTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.contributions = await this.objectMapper.mapIterable(
      projectModel.contributions,
      ContributionTypeOrmEntity,
      { project: projectEntity },
    );
    projectEntity.milestones = await this.objectMapper.mapIterable(
      projectModel.milestones,
      MilestoneTypeOrmEntity,
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
    const project = new InternalProject(
      ProjectId.from(projectEntity.id),
      CreatedAt.from(projectEntity.createdAt),
      UpdatedAt.from(projectEntity.updatedAt),
      ProjectTitle.from(projectEntity.title),
      ProjectDescription.from(projectEntity.description),
      projectEntity.meta,
      UserId.from(projectEntity.creatorId),
      getProjectState(projectEntity.state),
      ContributionVisibility.ofValue(projectEntity.contributionVisibility),
      PeerReviewVisibility.ofLabel(projectEntity.peerReviewVisibility),
      SkipManagerReview.from(projectEntity.skipManagerReview),
      new RoleCollection([]),
      PeerReviewCollection.empty(),
      new ReviewTopicCollection([]),
      new ContributionCollection([]),
      new MilestoneCollection([]),
    );
    project.roles = new RoleCollection(
      await this.objectMapper.mapIterable(projectEntity.roles, Role, {
        project,
      }),
    );
    project.peerReviews = PeerReviewCollection.of(
      await this.objectMapper.mapIterable(
        projectEntity.peerReviews,
        PeerReview,
        { project },
      ),
    );
    project.reviewTopics = new ReviewTopicCollection(
      await this.objectMapper.mapIterable(
        projectEntity.reviewTopics,
        ReviewTopic,
        { project },
      ),
    );
    project.contributions = new ContributionCollection(
      await this.objectMapper.mapIterable(
        projectEntity.contributions,
        Contribution,
        { project },
      ),
    );
    project.milestones = new MilestoneCollection(
      await this.objectMapper.mapIterable(projectEntity.milestones, Milestone, {
        project,
      }),
    );
    return project;
  }
}
