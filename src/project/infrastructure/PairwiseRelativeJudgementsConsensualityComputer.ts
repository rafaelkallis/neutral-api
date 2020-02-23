import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b) / arr.length;
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
  public compute(peerReviewCollection: PeerReviewCollection): Consensuality {
    const peerReviews = peerReviewCollection.toMap();
    const peers = Object.keys(peerReviews);
    function Rkij(k: string, i: string, j: string): number {
      return peerReviews[k][i] / peerReviews[k][j];
    }
    function meanRij(i: string, j: string): number {
      return mean(
        peers.filter(k => k !== i && k !== j).map(k => Rkij(k, i, j)),
      );
    }
    function devRij(i: string, j: string): number {
      return mean(
        peers
          .filter(k => k !== i && k !== j)
          .map(k => Math.abs(Rkij(k, i, j) - meanRij(i, j))),
      );
    }
    return Consensuality.from(
      1 -
        mean(
          peers.flatMap(i => peers.filter(j => j !== i).map(j => devRij(i, j))),
        ),
    );
  }
}

/* eslint-enable security/detect-object-injection */
