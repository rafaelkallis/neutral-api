import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b);
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b) / arr.length;
}

/**
 * Computes consensuality using mean deviation method.
 *
 * Given peer review matrix M (n x n),
 *  let M_{ij} be the review of i over j,
 *  where M_{ii} = 0,
 *  then let:
 *
 *  1) column mean
 *
 *              sum_{i != j} M_{ij}
 *    CM(j) := --------------------- , card(i != j) == n - 1
 *                    n - 1
 *
 *
 *  2) column mean deviation
 *
 *    CMD(j) := sum_{i != j} abs(M_{ij} - CM(j))
 *
 *
 *  3) max column mean deviation
 *
 *               2 (n - 2)
 *    maxCMD := -----------
 *                 n - 1
 *
 *
 *  4) normalized column mean deviation
 *
 *                   CMD(j)
 *    normCMD(j) := --------
 *                   maxCMD
 *
 *
 *  5) consensuality
 *
 *                    sum_j normCMD(j)
 *    consens := 1 - ------------------ , card(j) == n
 *                           n
 *
 */
@Injectable()
export class MeanDeviationConsensualityComputerService extends ConsensualityComputer {
  protected computeForReviewTopic(
    peerReviewCollection: PeerReviewCollection,
  ): Consensuality {
    const peerReviews = peerReviewCollection.toNormalizedMap();
    const peers = Object.keys(peerReviews);
    const n = peers.length;
    function columnMean(j: string): number {
      return (
        sum(peers.filter((i) => i !== j).map((i) => peerReviews[i][j])) /
        (n - 1)
      );
    }
    function columnMeanDeviation(j: string): number {
      return sum(
        peers
          .filter((i) => i !== j)
          .map((i) => Math.abs(peerReviews[i][j] - columnMean(j))),
      );
    }
    const maxColumnMeanDeviation = (2 * (n - 2)) / (n - 1);
    const nonConsenuality = mean(
      peers.map((j) => columnMeanDeviation(j) / maxColumnMeanDeviation),
    );
    return Consensuality.from(1 - nonConsenuality);
  }
}
