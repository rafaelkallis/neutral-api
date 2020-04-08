import { ModelCollection } from 'shared/domain/ModelCollection';
import { PeerReview } from 'project/domain/PeerReview';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { PeerReviewId } from 'project/domain/value-objects/PeerReviewId';
import { RoleId } from 'project/domain/value-objects/RoleId';

export class PeerReviewCollection extends ModelCollection<
  PeerReviewId,
  PeerReview
> {
  public static empty(): PeerReviewCollection {
    return new PeerReviewCollection([]);
  }

  public static fromMap(
    peerReviewMap: Record<string, Record<string, number>>,
  ): PeerReviewCollection {
    const peerReviews: PeerReview[] = [];
    for (const sender of Object.keys(peerReviewMap)) {
      for (const [receiver, score] of Object.entries(peerReviewMap[sender])) {
        peerReviews.push(
          PeerReview.from(
            RoleId.from(sender),
            RoleId.from(receiver),
            PeerReviewScore.from(score),
          ),
        );
      }
    }
    return new PeerReviewCollection(peerReviews);
  }

  public findBySenderRole(senderRoleId: RoleId): Iterable<PeerReview> {
    return this.filter((peerReview) => peerReview.isSenderRole(senderRoleId));
  }

  public addForSender(
    senderRoleId: RoleId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
  ): PeerReview[] {
    const addedPeerReviews: PeerReview[] = [];
    for (const [receiverRoleId, score] of submittedPeerReviews) {
      const peerReview = PeerReview.from(senderRoleId, receiverRoleId, score);
      addedPeerReviews.push(peerReview);
      this.add(peerReview);
    }
    return addedPeerReviews;
  }

  public toMap(): Record<string, Record<string, number>> {
    const map: Record<string, Record<string, number>> = {};
    for (const { senderRoleId, receiverRoleId, score } of this) {
      if (!map[senderRoleId.value]) {
        map[senderRoleId.value] = {};
      }
      map[senderRoleId.value][receiverRoleId.value] = score.value;
    }
    return map;
  }

  public getNumberOfPeers(): number {
    return Object.keys(this.toMap()).length;
  }
}
