import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b);
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b) / arr.length;
}

/**
 * Computes consensuality using statistical variance.
 *
 * Given peer review matrix M (n x n),
 *  let M_{ij} be the review of i over j,
 *  where M_{ii} = 0,
 *  then let:
 *
 *  1) column variance
 *
 *    var(j)
 *
 *
 *  2) max column variance
 *
 *    maxVar := var([1, 0, ..., 0]) , where card([1, 0, ..., 0]) == n - 1
 *
 *
 *  3) normalized column variance
 *
 *                   var(j)
 *    normVar(j) := --------
 *                   maxVar
 *
 *
 *  4) consensuality
 *
 *                    sum_j normVar(j)
 *    consens := 1 - ------------------ , card(j) == n
 *                           n
 */
@Injectable()
export class VarianceConsensualityComputerService
  implements ConsensualityComputer {
  public compute(peerReviewCollection: PeerReviewCollection): Consensuality {
    const peerReviews = peerReviewCollection.toMap();
    const peers = Object.keys(peerReviews);
    const n = peers.length;
    function variance(arr: number[]): number {
      const n = arr.length;
      const mean = sum(arr) / n;
      const squaredSum = sum(arr.map((x) => Math.pow(x - mean, 2)));
      return squaredSum / n;
    }
    function worstColumn(n: number): number[] {
      const arr = new Array(n);
      arr.fill(0);
      arr[0] = 1;
      return arr;
    }
    function column(j: string): number[] {
      return peers.filter((i) => i !== j).map((i) => peerReviews[i][j]);
    }
    return Consensuality.from(
      1 -
        mean(
          peers.map((j) => variance(column(j)) / variance(worstColumn(n - 1))),
        ),
    );
  }
}
