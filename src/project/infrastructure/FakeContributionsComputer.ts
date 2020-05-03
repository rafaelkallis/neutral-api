import { Injectable } from '@nestjs/common';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

@Injectable()
export class FakeContributionsComputer extends ContributionsComputer {
  public compute(
    peerReviews: ReadonlyPeerReviewCollection,
  ): ContributionCollection {
    const contributions: Contribution[] = [];
    const peers = new Set<string>();
    const reviewTopics = new Set<string>();
    for (const peerReview of peerReviews.toArray()) {
      peers.add(peerReview.senderRoleId.value);
      reviewTopics.add(peerReview.reviewTopicId.value);
    }
    for (const reviewTopic of reviewTopics) {
      for (const peer of peers) {
        contributions.push(
          Contribution.from(
            RoleId.from(peer),
            ReviewTopicId.from(reviewTopic),
            ContributionAmount.from(1 / peers.size),
          ),
        );
      }
    }
    return new ContributionCollection(contributions);
  }
}
