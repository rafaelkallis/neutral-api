import {
  ModelCollection,
  ReadonlyModelCollection,
} from 'shared/domain/ModelCollection';
import {
  PeerReview,
  ReadonlyPeerReview,
} from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

export interface ReadonlyPeerReviewCollection
  extends ReadonlyModelCollection<PeerReviewId, ReadonlyPeerReview> {
  getReviewTopics(): ReadonlyArray<ReviewTopicId>;
  getPeers(): ReadonlyArray<RoleId>;
  findBySenderRole(senderRoleId: RoleId): ReadonlyPeerReviewCollection;
  findByReceiverRole(receiverRoleId: RoleId): ReadonlyPeerReviewCollection;
  findByReviewTopic(reviewTopicId: ReviewTopicId): ReadonlyPeerReviewCollection;
  addForSender(
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
  ): ReadonlyArray<ReadonlyPeerReview>; // TODO return ReadonlyPeerReviewCollection
  getNumberOfPeers(): number;
}

export class PeerReviewCollection
  extends ModelCollection<PeerReviewId, PeerReview>
  implements ReadonlyPeerReviewCollection {
  public static fromMap(
    peerReviewMap: Record<string, Record<string, number>>,
    reviewTopicId: ReviewTopicId,
  ): ReadonlyPeerReviewCollection {
    const peerReviews: PeerReview[] = [];
    for (const sender of Object.keys(peerReviewMap)) {
      for (const [receiver, score] of Object.entries(peerReviewMap[sender])) {
        peerReviews.push(
          PeerReview.from(
            RoleId.from(sender),
            RoleId.from(receiver),
            reviewTopicId,
            PeerReviewScore.from(score),
          ),
        );
      }
    }
    return new PeerReviewCollection(peerReviews);
  }

  public getReviewTopics(): ReadonlyArray<ReviewTopicId> {
    const reviewTopics = new Map<string, ReviewTopicId>();
    for (const peerReview of this.toArray()) {
      reviewTopics.set(
        peerReview.reviewTopicId.value,
        peerReview.reviewTopicId,
      );
    }
    return Array.from(reviewTopics.values());
  }

  public getPeers(): ReadonlyArray<RoleId> {
    const peers = new Map<string, RoleId>();
    for (const peerReview of this) {
      peers.set(peerReview.senderRoleId.value, peerReview.senderRoleId);
      peers.set(peerReview.receiverRoleId.value, peerReview.receiverRoleId);
    }
    return Array.from(peers.values());
  }

  public findByReviewTopic(reviewTopicId: ReviewTopicId): PeerReviewCollection {
    return this.filter((peerReview) =>
      peerReview.reviewTopicId.equals(reviewTopicId),
    );
  }

  public findBySenderRole(senderRoleId: RoleId): PeerReviewCollection {
    return this.filter((peerReview) => peerReview.isSenderRole(senderRoleId));
  }

  public findByReceiverRole(receiverRoleId: RoleId): PeerReviewCollection {
    return this.filter((peerReview) =>
      peerReview.isReceiverRole(receiverRoleId),
    );
  }

  public addForSender(
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
  ): PeerReview[] {
    const addedPeerReviews: PeerReview[] = [];
    for (const [receiverRoleId, score] of submittedPeerReviews) {
      const peerReview = PeerReview.from(
        senderRoleId,
        receiverRoleId,
        reviewTopicId,
        score,
      );
      addedPeerReviews.push(peerReview);
      this.add(peerReview);
    }
    return addedPeerReviews;
  }

  public toMap(): Record<string, Record<string, number>> {
    const map: Record<string, Record<string, number>> = {};
    for (const { senderRoleId, receiverRoleId, score } of this.toArray()) {
      if (!map[senderRoleId.value]) {
        map[senderRoleId.value] = {};
      }
      map[senderRoleId.value][receiverRoleId.value] = score.value;
    }
    return map;
  }

  public getNumberOfPeers(): number {
    return this.getPeers().length;
  }

  protected filter(
    predicate: (peerReview: PeerReview) => boolean,
  ): PeerReviewCollection {
    return new PeerReviewCollection(this.toArray().filter(predicate));
  }
}
