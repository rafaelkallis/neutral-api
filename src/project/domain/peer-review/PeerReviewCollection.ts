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
import { ReadonlyProject } from 'project/domain/project/Project';
import { PeerReviewsAlreadySubmittedException } from '../exceptions/PeerReviewsAlreadySubmittedException';
import { Role } from 'project/domain/role/Role';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

export interface ReadonlyPeerReviewCollection
  extends ReadonlyModelCollection<PeerReviewId, ReadonlyPeerReview> {
  getReviewTopics(): ReadonlyArray<ReviewTopicId>;
  getPeers(): ReadonlyArray<RoleId>;
  whereSenderRole(senderRoleOrId: Role | RoleId): ReadonlyPeerReviewCollection;
  whereReceiverRole(
    receiverRoleOrId: Role | RoleId,
  ): ReadonlyPeerReviewCollection;
  whereReviewTopic(
    reviewTopicOrId: ReviewTopic | ReviewTopicId,
  ): ReadonlyPeerReviewCollection;
  getNumberOfPeers(): number;

  // TODO make project private readonly
  areSubmitted(project: ReadonlyProject): boolean;
  assertSubmitted(project: ReadonlyProject): void;
  areSubmittedForReviewTopic(
    project: ReadonlyProject,
    reviewTopicId: ReviewTopicId,
  ): boolean;
  areSubmittedForSenderRole(
    project: ReadonlyProject,
    senderRoleId: RoleId,
  ): boolean;
  areSubmittedForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): boolean;
  assertNotSubmittedForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void;
}

export class PeerReviewCollection
  extends ModelCollection<PeerReviewId, PeerReview>
  implements ReadonlyPeerReviewCollection {
  public static fromMap(
    peerReviewMap: Record<string, Record<string, number>>,
    reviewTopicId: ReviewTopicId,
  ): PeerReviewCollection {
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

  public whereReviewTopic(
    reviewTopicOrId: ReviewTopic | ReviewTopicId,
  ): ReadonlyPeerReviewCollection {
    const reviewTopicId = this.getId(reviewTopicOrId);
    return this.filter((peerReview) =>
      peerReview.reviewTopicId.equals(reviewTopicId),
    );
  }

  public whereSenderRole(
    senderRoleOrId: Role | RoleId,
  ): ReadonlyPeerReviewCollection {
    const senderRoleId = this.getId(senderRoleOrId);
    return this.filter((peerReview) => peerReview.isSenderRole(senderRoleId));
  }

  public whereReceiverRole(
    receiverRoleOrId: Role | RoleId,
  ): ReadonlyPeerReviewCollection {
    const receiverRoleId = this.getId(receiverRoleOrId);
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

  public areSubmitted(project: ReadonlyProject): boolean {
    for (const reviewTopic of project.reviewTopics) {
      for (const senderRole of project.roles) {
        if (
          !this.areSubmittedForSenderRoleAndReviewTopic(
            project,
            senderRole.id,
            reviewTopic.id,
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }

  public assertSubmitted(project: ReadonlyProject): void {
    if (!this.areSubmitted(project)) {
      throw new Error('peer reviews not complete');
    }
  }

  public areSubmittedForReviewTopic(
    project: ReadonlyProject,
    reviewTopicId: ReviewTopicId,
  ): boolean {
    project.reviewTopics.assertContains(reviewTopicId);
    for (const senderRole of project.roles) {
      if (
        !this.areSubmittedForSenderRoleAndReviewTopic(
          project,
          senderRole.id,
          reviewTopicId,
        )
      ) {
        return false;
      }
    }
    return true;
  }

  public areSubmittedForSenderRole(
    project: ReadonlyProject,
    senderRoleId: RoleId,
  ): boolean {
    project.roles.assertContains(senderRoleId);
    for (const reviewTopic of project.reviewTopics) {
      if (
        !this.areSubmittedForSenderRoleAndReviewTopic(
          project,
          senderRoleId,
          reviewTopic.id,
        )
      ) {
        return false;
      }
    }
    return true;
  }

  public areSubmittedForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): boolean {
    project.roles.assertContains(senderRoleId);
    project.reviewTopics.assertContains(reviewTopicId);
    for (const receiverRole of project.roles) {
      if (
        this.whereReviewTopic(reviewTopicId)
          .whereSenderRole(senderRoleId)
          .whereReceiverRole(receiverRole.id)
          .isEmpty()
      ) {
        return false;
      }
    }
    return true;
  }

  public assertNotSubmittedForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void {
    if (
      this.areSubmittedForSenderRoleAndReviewTopic(
        project,
        senderRoleId,
        reviewTopicId,
      )
    ) {
      throw new PeerReviewsAlreadySubmittedException();
    }
  }

  protected filter(
    predicate: (peerReview: PeerReview) => boolean,
  ): ReadonlyPeerReviewCollection {
    return new PeerReviewCollection(this.toArray().filter(predicate));
  }
}
