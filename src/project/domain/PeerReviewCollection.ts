import { ModelCollection } from 'common/domain/ModelCollection';
import { Id } from 'common/domain/value-objects/Id';
import { PeerReview } from 'project/domain/PeerReview';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';

export class PeerReviewCollection extends ModelCollection<PeerReview> {
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
            Id.from(sender),
            Id.from(receiver),
            PeerReviewScore.from(score),
          ),
        );
      }
    }
    return new PeerReviewCollection(peerReviews);
  }

  public findBySenderRole(senderRoleId: Id): ReadonlyArray<PeerReview> {
    return this.toArray().filter(peerReview =>
      peerReview.isSenderRole(senderRoleId),
    );
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
}
