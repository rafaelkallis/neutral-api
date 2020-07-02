import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b);
}

function mean(arr: number[]): number {
  return sum(arr) / arr.length;
}

/**
 * Computes consensuality using pairwise relative judgements.
 */
@Injectable()
export class PairwiseRelativeJudgementsConsensualityComputer extends ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  protected computeForReviewTopic(
    peerReviews: PeerReviewCollection,
  ): Consensuality {
    const n = peerReviews.getNumberOfPeers();
    const maxDissent = this.computeDissent(this.createCyclicPeerReviews(n));
    const absoluteDissent = this.computeDissent(peerReviews);
    if (maxDissent === 0) {
      if (absoluteDissent !== 0) {
        throw new Error('invariant violation');
      }
      return Consensuality.from(1);
    }
    const normalizedDissent = absoluteDissent / maxDissent;
    const consensuality = 1 - normalizedDissent;
    return Consensuality.from(consensuality);
  }

  private computeDissent(peerReviewCollection: PeerReviewCollection): number {
    const peerReviews = peerReviewCollection.toMap();
    const peers = Object.keys(peerReviews);
    function R_ijk(i: string, j: string, k: string): number {
      return peerReviews[i][j] / peerReviews[i][k];
    }
    function mu_jk(j: string, k: string): number {
      return mean(
        peers.filter((i) => i !== j && i !== k).map((i) => R_ijk(i, j, k)),
      );
    }
    function sigma_sq_jk(j: string, k: string): number {
      return mean(
        peers
          .filter((i) => i !== j && i !== k)
          .map((i) => Math.pow(R_ijk(i, j, k) - mu_jk(j, k), 2)),
      );
    }
    return sum(
      peers.flatMap((j) =>
        peers.filter((k) => k !== j).map((k) => sigma_sq_jk(j, k)),
      ),
    );
  }

  private createCyclicPeerReviews(n: number): PeerReviewCollection {
    const peerReviews = new PeerReviewCollection([]);
    const peers = [];
    for (let i = 0; i < n; i++) {
      peers.push(RoleId.create());
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i == j) {
          continue;
        }
        let score: number;
        if ((i + 1) % n == j) {
          score = 1;
        } else {
          score = 0;
        }
        const peerReview = PeerReview.from(
          peers[i],
          peers[j],
          ReviewTopicId.create(),
          PeerReviewScore.from(score),
        );
        peerReviews.add(peerReview);
      }
    }
    return peerReviews;
  }
}
