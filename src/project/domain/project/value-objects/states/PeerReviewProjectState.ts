import {
  ProjectState,
  DefaultProjectState,
} from 'project/domain/project/value-objects/states/ProjectState';
import { InternalProject } from 'project/domain/project/Project';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { FinishedProjectState } from 'project/domain/project/value-objects/states/FinishedProjectState';
import { ProjectPeerReviewFinishedEvent } from 'project/domain/events/ProjectPeerReviewFinishedEvent';
import { ProjectManagerReviewSkippedEvent } from 'project/domain/events/ProjectManagerReviewSkippedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { ManagerReviewProjectState } from 'project/domain/project/value-objects/states/ManagerReviewProjectState';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { CancellableProjectState } from 'project/domain/project/value-objects/states/CancellableProjectState';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export class PeerReviewProjectState extends DefaultProjectState {
  public static readonly INSTANCE: ProjectState = new CancellableProjectState(
    new PeerReviewProjectState(),
  );

  private constructor() {
    super();
  }

  public submitPeerReviews(
    project: InternalProject,
    peerReviews: PeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    for (const peerReview of peerReviews) {
      project.roles.assertContains(
        peerReview.senderRoleId,
        () =>
          new DomainException(
            'peer_review_sender_not_found',
            'The peer-review sender was not found',
          ),
      );
      project.roles.assertContains(
        peerReview.receiverRoleId,
        () =>
          new DomainException(
            'peer_review_receiver_not_found',
            'The peer-review receiver was not found',
          ),
      );
      project.reviewTopics.assertContains(
        peerReview.reviewTopicId,
        () =>
          new DomainException(
            'peer_review_review_topic_not_found',
            'The peer-review review-topic was not found',
          ),
      );
      // cannot update peer-review
      if (
        !project.peerReviews
          .whereSenderRole(peerReview.senderRoleId)
          .whereReceiverRole(peerReview.receiverRoleId)
          .whereReviewTopic(peerReview.reviewTopicId)
          .isEmpty()
      ) {
        throw new DomainException(
          'peer_review_already_submitted',
          'Peer review already submitted',
        );
      }
    }
    project.peerReviews.addAll(peerReviews);
    project.raise(new PeerReviewsSubmittedEvent(project, peerReviews));

    if (!project.peerReviews.areComplete(project)) {
      return;
    }

    project.raise(new FinalPeerReviewSubmittedEvent(project));
    contributionsComputer.compute(project).applyTo(project);
    consensualityComputer.compute(project).applyTo(project);

    if (project.skipManagerReview.shouldSkipManagerReview(project)) {
      project.state = FinishedProjectState.INSTANCE;
      project.raise(new ProjectPeerReviewFinishedEvent(project.id));
      project.raise(new ProjectManagerReviewSkippedEvent(project.id));
      project.raise(new ProjectFinishedEvent(project));
    } else {
      project.state = ManagerReviewProjectState.INSTANCE;
      project.raise(new ProjectPeerReviewFinishedEvent(project.id));
      project.raise(new ProjectManagerReviewStartedEvent(project));
    }
  }
}
