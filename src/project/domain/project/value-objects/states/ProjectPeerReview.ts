import {
  ProjectState,
  DefaultProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { HasSubmittedPeerReviews } from 'project/domain/role/value-objects/HasSubmittedPeerReviews';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { Role } from 'project/domain/role/Role';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { ProjectFinished } from 'project/domain/project/value-objects/states/ProjectFinished';
import { ProjectPeerReviewFinishedEvent } from 'project/domain/events/ProjectPeerReviewFinishedEvent';
import { ProjectManagerReviewSkippedEvent } from 'project/domain/events/ProjectManagerReviewSkippedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { ProjectManagerReview } from 'project/domain/project/value-objects/states/ProjectManagerReview';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { CancellableState } from 'project/domain/project/value-objects/states/CancellableState';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

export class ProjectPeerReview extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new CancellableState(
    new ProjectPeerReview(),
  );

  private constructor() {
    super();
  }

  public submitPeerReviews(
    project: Project,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    const senderRole = project.roles.findById(senderRoleId);
    senderRole.assertHasNotSubmittedPeerReviews();
    this.assertSubmittedPeerReviewsMatchRoles(
      project,
      senderRole,
      submittedPeerReviews,
    );
    const addedPeerReviews = project.peerReviews.addForSender(
      senderRole.id,
      reviewTopicId,
      submittedPeerReviews,
    );
    senderRole.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    project.raise(
      new PeerReviewsSubmittedEvent(project, senderRole, addedPeerReviews),
    );
    if (project.roles.allHaveSubmittedPeerReviews()) {
      project.raise(new FinalPeerReviewSubmittedEvent(project));
      this.finishPeerReview(
        project,
        contributionsComputer,
        consensualityComputer,
      );
    }
  }
  /**
   * Asserts that the submitted peer reviews match the project's roles.
   * @param senderRole Role of peer review sender.
   * @param submittedPeerReviews Submitted peer reviews
   */
  private assertSubmittedPeerReviewsMatchRoles(
    project: ReadonlyProject,
    senderRole: Role,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
  ): void {
    const expectedIds: RoleId[] = Array.from(
      project.roles.excluding(senderRole),
    ).map((role) => role.id);
    const actualIds: RoleId[] = submittedPeerReviews.map(
      ([receiverRoleId]) => receiverRoleId,
    );
    for (const expectedId of expectedIds) {
      const matchCount = actualIds.filter((actualId) =>
        actualId.equals(expectedId),
      ).length;
      if (matchCount !== 1) {
        throw new PeerReviewRoleMismatchException();
      }
    }
    for (const actualId of actualIds) {
      const matchCount = expectedIds.filter((expectedId) =>
        expectedId.equals(actualId),
      ).length;
      if (matchCount !== 1) {
        throw new PeerReviewRoleMismatchException();
      }
    }
  }

  /**
   * Gets called when final peer review is submitted for a team.
   */
  private finishPeerReview(
    project: Project,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    contributionsComputer.compute(project.peerReviews).applyTo(project);
    consensualityComputer.compute(project.peerReviews).applyTo(project);

    if (project.skipManagerReview.shouldSkipManagerReview(project)) {
      project.state = ProjectFinished.INSTANCE;
      project.raise(new ProjectPeerReviewFinishedEvent(project.id));
      project.raise(new ProjectManagerReviewSkippedEvent(project.id));
      project.raise(new ProjectFinishedEvent(project));
    } else {
      project.state = ProjectManagerReview.INSTANCE;
      project.raise(new ProjectPeerReviewFinishedEvent(project.id));
      project.raise(new ProjectManagerReviewStartedEvent(project));
    }
  }
}
