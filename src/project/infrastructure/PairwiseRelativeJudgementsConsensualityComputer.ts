import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { PeerReview } from 'project/domain/PeerReview';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { Id } from 'common/domain/value-objects/Id';

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
export class PairwiseRelativeJudgementsConsensualityComputerService
  implements ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  public compute(peerReviews: PeerReviewCollection): Consensuality {
    const n = peerReviews.getNumberOfPeers();
    const cyclicPeerReviews = this.createCyclicPeerReviews(n);
    const normalizedDissent =
      this.computeDissent(peerReviews) / this.computeDissent(cyclicPeerReviews);
    const consensuality = 1 - normalizedDissent;
    return Consensuality.from(consensuality);
  }

  private computeDissent(peerReviewCollection: PeerReviewCollection): number {
    const peerReviews = peerReviewCollection.toMap();
    const peers = Object.keys(peerReviews);
    function R_kij(k: string, i: string, j: string): number {
      return peerReviews[k][i] / peerReviews[k][j];
    }
    function mean_ij(i: string, j: string): number {
      return mean(
        peers.filter(k => k !== i && k !== j).map(k => R_kij(k, i, j)),
      );
    }
    function var_ij(i: string, j: string): number {
      return mean(
        peers
          .filter(k => k !== i && k !== j)
          .map(k => Math.pow(R_kij(k, i, j) - mean_ij(i, j), 2)),
      );
    }
    return sum(
      peers.flatMap(i => peers.filter(j => j !== i).map(j => var_ij(i, j))),
    );
  }

  private createCyclicPeerReviews(n: number): PeerReviewCollection {
    const peerReviews = PeerReviewCollection.empty();
    const peers = [];
    for (let i = 0; i < n; i++) {
      peers.push(Id.create());
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i == j) {
          continue;
        }
        let score: number;
        if ((i + 1) % n == j) {
          score = 1 - (n - 2) * PeerReviewScore.EPSILON;
        } else {
          score = PeerReviewScore.EPSILON;
        }
        const peerReview = PeerReview.from(
          peers[i],
          peers[j],
          PeerReviewScore.from(score),
        );
        peerReviews.add(peerReview);
      }
    }
    return peerReviews;
  }
}

/* eslint-enable security/detect-object-injection */
