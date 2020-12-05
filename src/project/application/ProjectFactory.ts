import { Injectable } from '@nestjs/common';
import { Project } from 'project/domain/project/Project';
import { ReadonlyUser } from 'user/domain/User';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import {
  ContributionVisibility,
  SelfContributionVisiblity,
} from 'project/domain/project/value-objects/ContributionVisibility';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ReviewTopicCollection } from 'project/domain/review-topic/ReviewTopicCollection';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { AggregateRootFactory } from 'shared/application/AggregateRootFactory';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { PeerReviewVisibility } from 'project/domain/project/value-objects/PeerReviewVisibility';
import { MilestoneCollection } from 'project/domain/milestone/MilestoneCollection';

export interface CreateProjectOptions {
  title: ProjectTitle;
  description: ProjectDescription;
  meta: Record<string, unknown>;
  creator: ReadonlyUser;
  contributionVisibility?: ContributionVisibility;
  peerReviewVisibility?: PeerReviewVisibility;
  peerReview?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

@Injectable()
export class ProjectFactory extends AggregateRootFactory<
  CreateProjectOptions,
  ProjectId,
  Project
> {
  protected doCreate({
    title,
    description,
    meta,
    creator,
    contributionVisibility,
    peerReviewVisibility,
    skipManagerReview,
  }: CreateProjectOptions): Project {
    const projectId = ProjectId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const state = FormationProjectState.INSTANCE;
    const roles = new RoleCollection([]);
    const peerReviews = PeerReviewCollection.empty();
    const reviewTopics = new ReviewTopicCollection([]);
    const contributions = new ContributionCollection([]);
    const milestones = new MilestoneCollection([]);
    const project = Project.of(
      projectId,
      createdAt,
      updatedAt,
      title,
      description,
      meta,
      creator.id,
      state,
      contributionVisibility
        ? contributionVisibility
        : SelfContributionVisiblity.INSTANCE,
      peerReviewVisibility
        ? peerReviewVisibility
        : PeerReviewVisibility.MANAGER,
      skipManagerReview ? skipManagerReview : SkipManagerReview.IF_CONSENSUAL,
      roles,
      peerReviews,
      reviewTopics,
      contributions,
      milestones,
    );
    project.raise(new ProjectCreatedEvent(project, creator));
    project.raise(new ProjectFormationStartedEvent(project));
    return project;
  }
}
