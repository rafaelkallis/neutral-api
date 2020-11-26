import td from 'testdouble';
import { Project } from 'project/domain/project/Project';
import { ModelFaker } from './ModelFaker';
import { ReadonlyUser } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';
import { ReadonlyRole } from 'project/domain/role/Role';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import {
  ConsensualityComputer,
  ConsensualityComputationResult,
} from 'project/domain/ConsensualityComputer';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import {
  ReadonlyPeerReviewCollection,
  PeerReviewCollection,
} from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewFlag } from 'project/domain/peer-review/value-objects/PeerReviewFlag';
import { ReadonlyMilestone } from 'project/domain/milestone/Milestone';

export class ProjectTestHelper {
  public readonly project: Project;
  private static readonly modelFaker = new ModelFaker();

  public static of(project: Project): ProjectTestHelper {
    return new ProjectTestHelper(project);
  }

  public static ofCreator(userOrId: ReadonlyUser | UserId): ProjectTestHelper {
    const project = ProjectTestHelper.modelFaker.project(
      userOrId instanceof UserId ? userOrId : userOrId.id,
    );
    return new ProjectTestHelper(project);
  }

  public constructor(project: Project) {
    this.project = project;
  }

  public addRole(): ReadonlyRole {
    const role = ProjectTestHelper.modelFaker.role();
    return this.project.addRole(role.title, role.description);
  }

  public addRoles(count: number): Iterable<ReadonlyRole> {
    return new Array(count).map(() => this.addRole());
  }

  public addRoleAndAssign(user: ReadonlyUser): ReadonlyRole {
    const addedRole = this.addRole();
    this.project.assignUserToRole(user, addedRole.id);
    return addedRole;
  }

  public addRolesAndAssign(
    assignees: Iterable<ReadonlyUser>,
  ): Iterable<ReadonlyRole> {
    return Array.from(assignees).map((assignee) =>
      this.addRoleAndAssign(assignee),
    );
  }

  public addReviewTopic(): ReadonlyReviewTopic {
    const reviewTopic = ProjectTestHelper.modelFaker.reviewTopic();
    return this.project.addReviewTopic(
      reviewTopic.title,
      reviewTopic.description,
      reviewTopic.input,
    );
  }

  public addReviewTopics(count: number): Iterable<ReadonlyReviewTopic> {
    return new Array(count).map(() => this.addReviewTopic());
  }

  public addMilestone(): ReadonlyMilestone {
    const milestone = ProjectTestHelper.modelFaker.milestone(this.project);
    return this.project.addMilestone(milestone.title, milestone.description);
  }

  public async submitPeerReviewsForSenderAndReviewTopic(
    sender: ReadonlyRole,
    reviewTopic: ReadonlyReviewTopic,
  ): Promise<ReadonlyPeerReviewCollection> {
    const milestone = this.project.milestones.whereLatest();
    const contributionsComputer: ContributionsComputer = td.object();
    const computedContributions = new ContributionCollection([]);
    td.when(contributionsComputer.compute(milestone)).thenReturn(
      computedContributions,
    );
    const consensualityComputer: ConsensualityComputer = td.object();
    const consensualityComputationResult: ConsensualityComputationResult = td.object();
    td.when(consensualityComputer.compute(milestone)).thenReturn(
      consensualityComputationResult,
    );
    const peerReviews: PeerReviewCollection = PeerReviewCollection.of(
      this.project.roles
        .whereNot(sender)
        .toArray()
        .map((receiver) =>
          PeerReview.create(
            sender.id,
            receiver.id,
            reviewTopic.id,
            milestone.id,
            PeerReviewScore.of(1),
            PeerReviewFlag.NONE,
            this.project,
          ),
        ),
    );
    await this.project.submitPeerReviews(
      peerReviews,
      contributionsComputer,
      consensualityComputer,
    );
    return peerReviews;
  }

  public async completePeerReviews(): Promise<void> {
    const milestone = this.project.milestones.whereLatest();
    const contributionsComputer: ContributionsComputer = td.object();
    const computedContributions = new ContributionCollection([]);
    td.when(contributionsComputer.compute(milestone)).thenReturn(
      computedContributions,
    );
    const consensualityComputer: ConsensualityComputer = td.object();
    const consensualityComputationResult: ConsensualityComputationResult = td.object();
    td.when(consensualityComputer.compute(milestone)).thenReturn(
      consensualityComputationResult,
    );
    await this.project.completePeerReviews(
      contributionsComputer,
      consensualityComputer,
    );
  }
}
