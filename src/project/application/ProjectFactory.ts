import { Injectable } from '@nestjs/common';
import { ReadonlyProject, Project } from 'project/domain/project/Project';
import { ReadonlyUser } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ProjectFormation } from 'project/domain/project/value-objects/states/ProjectFormation';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ReviewTopicCollection } from 'project/domain/review-topic/ReviewTopicCollection';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { AggregateRootFactory } from 'shared/application/AggregateRootFactory';

export interface CreateProjectOptions {
  title: ProjectTitle;
  description: ProjectDescription;
  creator: ReadonlyUser;
  contributionVisibility?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

@Injectable()
export class ProjectFactory extends AggregateRootFactory<
  CreateProjectOptions,
  ProjectId,
  ReadonlyProject
> {
  protected doCreate({
    title,
    description,
    creator,
    contributionVisibility,
    skipManagerReview,
  }: CreateProjectOptions): ReadonlyProject {
    const projectId = ProjectId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const state = ProjectFormation.INSTANCE;
    const consensuality = null;
    const roles = new RoleCollection([]);
    const peerReviews = new PeerReviewCollection([]);
    const reviewTopics = new ReviewTopicCollection([]);
    const project = new Project(
      projectId,
      createdAt,
      updatedAt,
      title,
      description,
      creator.id,
      state,
      consensuality,
      contributionVisibility
        ? contributionVisibility
        : ContributionVisibility.SELF,
      skipManagerReview ? skipManagerReview : SkipManagerReview.IF_CONSENSUAL,
      roles,
      peerReviews,
      reviewTopics,
    );
    project.raise(new ProjectCreatedEvent(project, creator));
    project.raise(new ProjectFormationStartedEvent(project));
    return project;
  }
}
