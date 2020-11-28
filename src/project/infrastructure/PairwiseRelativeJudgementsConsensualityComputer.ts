import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';

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
  protected doCompute(
    peerReviews: Record<string, Record<string, number>>,
  ): Consensuality {
    const n = Object.keys(peerReviews).length;
    const maxDissent = this.computeDissent(this.createCyclicPeerReviews(n));
    const absoluteDissent = this.computeDissent(peerReviews);
    if (maxDissent === 0) {
      if (absoluteDissent !== 0) {
        throw new Error('invariant violation');
      }
      return Consensuality.from(1);
    }
    const normalizedDissent = absoluteDissent / maxDissent;
    console.log(absoluteDissent, maxDissent, normalizedDissent);
    const consensuality = 1 - normalizedDissent;
    //console.log('maxDissent       : ' + absoluteDissent);
    //console.log('absoluteDissent  : ' + maxDissent);
    //console.log('normalizedDissent: ' + normalizedDissent);
    //console.log('consensuality    : ' + consensuality);
    return Consensuality.from(consensuality);
  }

  private computeDissent(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
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
    const dissent = sum(
      peers.flatMap((j) =>
        peers.filter((k) => k !== j).map((k) => sigma_sq_jk(j, k)),
      ),
    );
    return dissent;
  }

  private createCyclicPeerReviews(
    n: number,
  ): Record<string, Record<string, number>> {
    const peerReviews: Record<string, Record<string, number>> = {};
    for (let i = 0; i < n; i++) {
      peerReviews[String(i)] = {};
      for (let j = 0; j < n; j++) {
        if (i === j) {
          continue;
        }
        let score: number;
        if ((i + 1) % n === j) {
          score = 1;
        } else {
          score = 0;
        }
        peerReviews[String(i)][String(j)] = score;
      }
    }
    return peerReviews;
  }
}
