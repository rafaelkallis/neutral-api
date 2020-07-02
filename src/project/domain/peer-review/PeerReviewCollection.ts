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
import { DomainException } from 'shared/domain/exceptions/DomainException';

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
  toMatrix(reviewTopic: ReviewTopicId): number[][];
  toMatrixArray(): number[][][];
  getNumberOfReviewTopics(): number;
  getNumberOfPeers(): number;

  sumScores(): number;

  // TODO make project private readonly
  areComplete(project: ReadonlyProject): boolean;
  assertComplete(project: ReadonlyProject): void;
  areCompleteForReviewTopic(
    project: ReadonlyProject,
    reviewTopicId: ReviewTopicId,
  ): boolean;
  areCompleteForSenderRole(
    project: ReadonlyProject,
    senderRoleId: RoleId,
  ): boolean;
  areCompleteForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): boolean;
  assertCompleteForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void;
  assertNotCompleteForSenderRoleAndReviewTopic(
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

  public toMatrix(rId: ReviewTopicId): number[][] {
    const peers = this.getPeers();
    const S: number[][] = [];
    for (const [i, iId] of peers.entries()) {
      S[i] = [];
      for (const [j, jId] of peers.entries()) {
        if (i === j) {
          continue;
        }
        const peerReview = this.whereReviewTopic(rId)
          .whereSenderRole(iId)
          .whereReceiverRole(jId)
          .first();
        S[i][j] = peerReview.score.value;
        S[i][i] = 0;
      }
    }
    return S;
  }

  public toMatrixArray(): number[][][] {
    const reviewTopics = this.getReviewTopics();
    const peers = this.getPeers();
    const S: number[][][] = [];
    for (const [r, rId] of reviewTopics.entries()) {
      S[r] = [];
      for (const [i, iId] of peers.entries()) {
        S[r][i] = [];
        for (const [j, jId] of peers.entries()) {
          if (i === j) {
            continue;
          }
          const peerReview = this.whereReviewTopic(rId)
            .whereSenderRole(iId)
            .whereReceiverRole(jId)
            .first();
          S[r][i][j] = peerReview.score.value;
          S[r][i][i] = 0;
        }
      }
    }
    return S;
  }

  public getNumberOfReviewTopics(): number {
    return this.getReviewTopics().length;
  }

  public getNumberOfPeers(): number {
    return this.getPeers().length;
  }

  public areComplete(project: ReadonlyProject): boolean {
    for (const reviewTopic of project.reviewTopics) {
      for (const senderRole of project.roles) {
        if (
          !this.areCompleteForSenderRoleAndReviewTopic(
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

  public assertComplete(project: ReadonlyProject): void {
    if (!this.areComplete(project)) {
      throw new Error('peer reviews not complete');
    }
  }

  public areCompleteForReviewTopic(
    project: ReadonlyProject,
    reviewTopicId: ReviewTopicId,
  ): boolean {
    project.reviewTopics.assertContains(reviewTopicId);
    for (const senderRole of project.roles) {
      if (
        !this.areCompleteForSenderRoleAndReviewTopic(
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

  public areCompleteForSenderRole(
    project: ReadonlyProject,
    senderRoleId: RoleId,
  ): boolean {
    project.roles.assertContains(senderRoleId);
    for (const reviewTopic of project.reviewTopics) {
      if (
        !this.areCompleteForSenderRoleAndReviewTopic(
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

  public areCompleteForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRole: RoleId,
    reviewTopic: ReviewTopicId,
  ): boolean {
    project.roles.assertContains(
      senderRole,
      () =>
        new DomainException(
          'peer_review_sender_not_found',
          'The peer-review sender is not found',
        ),
    );
    project.reviewTopics.assertContains(
      reviewTopic,
      () =>
        new DomainException(
          'peer_review_review_topic_not_found',
          'The peer-review review-topic was not found',
        ),
    );
    const submittedPeerReviews = this.whereSenderRole(
      senderRole,
    ).whereReviewTopic(reviewTopic);
    for (const receiverRole of project.roles.whereNot(senderRole)) {
      if (submittedPeerReviews.whereReceiverRole(receiverRole.id).isEmpty()) {
        return false;
      }
    }
    // TODO work out numerics of 0.95
    if (submittedPeerReviews.sumScores() < 0.95) {
      return false;
    }
    if (submittedPeerReviews.sumScores() > 1) {
      return false;
    }
    return true;
  }

  public assertCompleteForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void {
    if (
      !this.areCompleteForSenderRoleAndReviewTopic(
        project,
        senderRoleId,
        reviewTopicId,
      )
    ) {
      throw new DomainException(
        'incomplete_peer_reviews',
        'Peer reviews are incomplete for given sender and review topic.',
      );
    }
  }

  public assertNotCompleteForSenderRoleAndReviewTopic(
    project: ReadonlyProject,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void {
    if (
      this.areCompleteForSenderRoleAndReviewTopic(
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

  public sumScores(): number {
    return this.toArray().reduce(
      (sum, peerReview) => sum + peerReview.score.value,
      0,
    );
  }
}
