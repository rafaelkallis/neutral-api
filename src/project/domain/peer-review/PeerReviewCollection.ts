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
import { Project, ReadonlyProject } from 'project/domain/project/Project';
import { PeerReviewsAlreadySubmittedException } from '../exceptions/PeerReviewsAlreadySubmittedException';
import { Role } from 'project/domain/role/Role';
import {
  ReadonlyReviewTopic,
  ReviewTopic,
} from 'project/domain/review-topic/ReviewTopic';
import { PeerReviewFlag } from './value-objects/PeerReviewFlag';
import { ReadonlyUser } from 'user/domain/User';
import { ReadonlyMilestone } from '../milestone/Milestone';
import { MilestoneId } from '../milestone/value-objects/MilestoneId';
import { Model } from 'shared/domain/Model';
import { DomainException } from 'shared/domain/exceptions/DomainException';

export interface ReadonlyPeerReviewCollection
  extends ReadonlyModelCollection<PeerReviewId, ReadonlyPeerReview> {
  getReviewTopics(): ReadonlyArray<ReviewTopicId>;
  getPeers(): ReadonlyArray<RoleId>;
  filterVisible(
    project: ReadonlyProject,
    user: ReadonlyUser,
  ): ReadonlyPeerReviewCollection;
  whereSenderRole(senderRoleOrId: Role | RoleId): ReadonlyPeerReviewCollection;
  whereReceiverRole(
    receiverRoleOrId: Role | RoleId,
  ): ReadonlyPeerReviewCollection;
  whereReviewTopic(
    reviewTopicOrId: ReadonlyReviewTopic | ReviewTopicId,
  ): ReadonlyPeerReviewCollection;
  whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyPeerReviewCollection;

  getNumberOfPeers(): number;

  toNormalizedMap(): Record<string, Record<string, number>>;
  sumScores(): number;
  meanScore(): number;

  areComplete(milestone: ReadonlyMilestone): boolean;
  assertComplete(milestone: ReadonlyMilestone): void;
  areCompleteForReviewTopic(
    milestone: ReadonlyMilestone,
    reviewTopicId: ReviewTopicId,
  ): boolean;
  areCompleteForSenderRole(
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
  ): boolean;
  areCompleteForSenderRoleAndReviewTopic(
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): boolean;
  assertCompleteForSenderRoleAndReviewTopic(
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void;
  assertNotCompleteForSenderRoleAndReviewTopic(
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void;
}

export class PeerReviewCollection
  extends ModelCollection<PeerReviewId, PeerReview>
  implements ReadonlyPeerReviewCollection {
  public static of(peerReviews: Iterable<PeerReview>): PeerReviewCollection {
    return new PeerReviewCollection(peerReviews);
  }

  public static empty(): PeerReviewCollection {
    return PeerReviewCollection.of([]);
  }

  public static ofMap(
    peerReviewMap: Record<string, Record<string, number>>,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    project: Project,
  ): PeerReviewCollection {
    const peerReviews: PeerReview[] = [];
    for (const sender of Object.keys(peerReviewMap)) {
      for (const [receiver, score] of Object.entries(peerReviewMap[sender])) {
        peerReviews.push(
          PeerReview.create(
            RoleId.from(sender),
            RoleId.from(receiver),
            reviewTopicId,
            milestoneId,
            PeerReviewScore.of(score),
            PeerReviewFlag.NONE,
            project,
          ),
        );
      }
    }
    return new PeerReviewCollection(peerReviews);
  }

  private constructor(peerReviews: Iterable<PeerReview>) {
    super(peerReviews);
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

  public filterVisible(
    project: ReadonlyProject,
    user: ReadonlyUser,
  ): ReadonlyPeerReviewCollection {
    return this.filter((peerReview) =>
      project.peerReviewVisibility.isVisible(peerReview.id, project, user),
    );
  }

  public whereReviewTopic(
    reviewTopicOrId: ReviewTopic | ReviewTopicId,
  ): ReadonlyPeerReviewCollection {
    const reviewTopicId = Model.getId(reviewTopicOrId);
    return this.filter((peerReview) =>
      peerReview.reviewTopicId.equals(reviewTopicId),
    );
  }

  public whereSenderRole(
    senderRoleOrId: Role | RoleId,
  ): ReadonlyPeerReviewCollection {
    const senderRoleId = Model.getId(senderRoleOrId);
    return this.filter((peerReview) => peerReview.isSenderRole(senderRoleId));
  }

  public whereReceiverRole(
    receiverRoleOrId: Role | RoleId,
  ): ReadonlyPeerReviewCollection {
    const receiverRoleId = Model.getId(receiverRoleOrId);
    return this.filter((peerReview) =>
      peerReview.isReceiverRole(receiverRoleId),
    );
  }

  public whereMilestone(
    milestoneOrId: ReadonlyMilestone | MilestoneId,
  ): ReadonlyPeerReviewCollection {
    const milestoneId = Model.getId(milestoneOrId);
    return this.filter((peerReview) =>
      milestoneId.equals(peerReview.milestone.id),
    );
  }

  public toNormalizedMap(): Record<string, Record<string, number>> {
    const map: Record<string, Record<string, number>> = {};
    for (const sender of this.getPeers()) {
      map[sender.value] = {};
      const rowsum = this.whereSenderRole(sender).sumScores();
      for (const peerReview of this.whereSenderRole(sender)) {
        map[sender.value][
          peerReview.receiverRoleId.value
        ] = peerReview.score.normalize(rowsum);
      }
    }
    return map;
  }

  public getNumberOfPeers(): number {
    return this.getPeers().length;
  }

  public areComplete(milestone: ReadonlyMilestone): boolean {
    for (const reviewTopic of milestone.project.reviewTopics) {
      for (const senderRole of milestone.project.roles) {
        if (
          !this.areCompleteForSenderRoleAndReviewTopic(
            milestone,
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

  public assertComplete(milestone: ReadonlyMilestone): void {
    if (!this.areComplete(milestone)) {
      throw new Error('peer reviews not complete');
    }
  }

  public areCompleteForReviewTopic(
    milestone: ReadonlyMilestone,
    reviewTopicId: ReviewTopicId,
  ): boolean {
    milestone.project.reviewTopics.assertContains(reviewTopicId);
    for (const senderRole of milestone.project.roles) {
      if (
        !this.areCompleteForSenderRoleAndReviewTopic(
          milestone,
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
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
  ): boolean {
    milestone.project.roles.assertContains(senderRoleId);
    for (const reviewTopic of milestone.project.reviewTopics) {
      if (
        !this.areCompleteForSenderRoleAndReviewTopic(
          milestone,
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
    milestone: ReadonlyMilestone,
    senderRole: RoleId,
    reviewTopic: ReviewTopicId,
  ): boolean {
    milestone.project.roles.assertContains(
      senderRole,
      () =>
        new DomainException(
          'peer_review_sender_not_found',
          'The peer-review sender is not found',
        ),
    );
    milestone.project.reviewTopics.assertContains(
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
    for (const receiverRole of milestone.project.roles.whereNot(senderRole)) {
      if (submittedPeerReviews.whereReceiverRole(receiverRole.id).isEmpty()) {
        return false;
      }
    }
    return true;
  }

  public assertCompleteForSenderRoleAndReviewTopic(
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void {
    if (
      !this.areCompleteForSenderRoleAndReviewTopic(
        milestone,
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
    milestone: ReadonlyMilestone,
    senderRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
  ): void {
    if (
      this.areCompleteForSenderRoleAndReviewTopic(
        milestone,
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

  public meanScore(): number {
    if (this.count() === 0) {
      return 1;
    }
    return this.sumScores() / this.count();
  }
}
