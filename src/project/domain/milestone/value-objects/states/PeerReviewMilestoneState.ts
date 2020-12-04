import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewFlag } from 'project/domain/peer-review/value-objects/PeerReviewFlag';
import { MilestoneState } from './MilestoneState';
import { CancellableMilestoneState } from './CancellableMilestoneState';
import { FinishedMilestoneState } from './FinishedMilestoneState';
import { PeerReviewFinishedEvent } from '../../events/PeerReviewFinishedEvent';
import { MilestoneFinishedEvent } from '../../events/MilestoneFinishedEvent';
import { ManagerReviewMilestoneState } from './ManagerReviewMilestoneState';
import { PeerReviewsSubmittedEvent } from '../../events/PeerReviewsSubmittedEvent';
import { InternalMilestone } from '../../Milestone';
import { ManagerReviewSkippedEvent } from '../../events/ManagerReviewSkippedEvent';
import { ManagerReviewStartedEvent } from '../../events/ManagerReviewStartedEvent';
import { FinalPeerReviewSubmittedEvent } from '../../events/FinalPeerReviewSubmittedEvent';

export class PeerReviewMilestoneState extends CancellableMilestoneState {
  public static readonly INSTANCE: MilestoneState = new PeerReviewMilestoneState();

  protected getOrdinal(): number {
    return 0;
  }

  public isTerminal(): boolean {
    return false;
  }

  /**
   *
   */
  public async submitPeerReviews(
    milestone: InternalMilestone,
    peerReviews: PeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    for (const peerReview of peerReviews) {
      milestone.project.roles.assertContains(
        peerReview.senderRoleId,
        () =>
          new DomainException(
            'peer_review_sender_not_found',
            'The peer-review sender was not found',
          ),
      );
      milestone.project.roles.assertContains(
        peerReview.receiverRoleId,
        () =>
          new DomainException(
            'peer_review_receiver_not_found',
            'The peer-review receiver was not found',
          ),
      );
      milestone.project.reviewTopics.assertContains(
        peerReview.reviewTopicId,
        () =>
          new DomainException(
            'peer_review_review_topic_not_found',
            'The peer-review review-topic was not found',
          ),
      );
      milestone.project.milestones.assertContains(
        peerReview.milestone.id,
        () =>
          new DomainException(
            'peer_review_milestone_not_found',
            'The peer-review milestone was not found',
          ),
      );
      // cannot update peer-review
      if (
        !milestone.peerReviews
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
    milestone.project.peerReviews.addAll(peerReviews);
    milestone.project.raise(
      new PeerReviewsSubmittedEvent(milestone, peerReviews),
    );

    if (!milestone.peerReviews.areComplete(milestone)) {
      return;
    }

    milestone.project.raise(new FinalPeerReviewSubmittedEvent(milestone));
    const computedContributions = contributionsComputer.compute(milestone); // TODO
    milestone.project.contributions.addAll(computedContributions);
    consensualityComputer.compute(milestone).applyTo(milestone.project);

    milestone.project.raise(new PeerReviewFinishedEvent(milestone));

    if (
      !milestone.project.skipManagerReview.shouldSkipManagerReview(
        milestone.project,
      )
    ) {
      milestone.state = ManagerReviewMilestoneState.INSTANCE;
      milestone.project.raise(new ManagerReviewStartedEvent(milestone));
    } else {
      milestone.state = FinishedMilestoneState.INSTANCE;
      milestone.project.raise(new ManagerReviewSkippedEvent(milestone));
      milestone.project.raise(new MilestoneFinishedEvent(milestone));
    }

    // because eslint is stupid
    await Promise.resolve();
  }

  /**
   *
   */
  public async completePeerReviews(
    milestone: InternalMilestone,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): Promise<void> {
    for (const reviewTopic of milestone.project.reviewTopics) {
      const meanReviewTopicScore = milestone.peerReviews
        .whereReviewTopic(reviewTopic)
        .meanScore();
      for (const sender of milestone.project.roles) {
        if (
          milestone.peerReviews.areCompleteForSenderRoleAndReviewTopic(
            milestone,
            sender.id,
            reviewTopic.id,
          )
        ) {
          continue;
        }
        const peerReviews = PeerReviewCollection.of(
          milestone.project.roles
            .whereNot(sender)
            .toArray()
            .map((receiver) =>
              PeerReview.create(
                sender.id,
                receiver.id,
                reviewTopic.id,
                milestone.id,
                PeerReviewScore.of(meanReviewTopicScore),
                PeerReviewFlag.ASBENT,
                milestone.project,
              ),
            ),
        );
        await milestone.project.submitPeerReviews(
          peerReviews,
          contributionsComputer,
          consensualityComputer,
        );
      }
    }
  }

  private constructor() {
    super();
  }
}
