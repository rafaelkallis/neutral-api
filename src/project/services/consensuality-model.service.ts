import { Injectable } from '@nestjs/common';

/* eslint-disable security/detect-object-injection */

/**
 * Consensuality model service
 */
@Injectable()
export class ConsensualityModelService {
  /**
   *
   */
  public static CONSENSUALITY_THRESHOLD = 0.8;

  /**
   * Computes a project's consensuality.
   */
  public computeConsensuality(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
    return this.meanDeviationMethod(peerReviews);
  }

  /**
   * Computes consensuality using mean deviation.
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
   *  5) non consensuality
   *
   *                   sum_j normCMD(j)
   *    nonConsens := ------------------ , card(j) == n
   *                         n
   *
   *
   *  6) consensuality
   *
   *    consens := 1 - nonConsens
   */
  public meanDeviationMethod(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
    const peers = Object.keys(peerReviews);
    const n = peers.length;
    const sum = (arr: number[]): number => arr.reduce((a, b) => a + b);
    function columnMean(j: string): number {
      return (
        sum(peers.filter(i => i !== j).map(i => peerReviews[i][j])) / (n - 1)
      );
    }
    function columnMeanDeviation(j: string): number {
      return sum(
        peers
          .filter(i => i !== j)
          .map(i => Math.abs(peerReviews[i][j] - columnMean(j))),
      );
    }
    const maxColumnMeanDeviation = (2 * (n - 2)) / (n - 1);
    const nonConsenuality =
      sum(peers.map(j => columnMeanDeviation(j) / maxColumnMeanDeviation)) / n;
    return 1 - nonConsenuality;
  }

  public isConsensual(consensuality: number): boolean {
    return consensuality >= ConsensualityModelService.CONSENSUALITY_THRESHOLD;
  }
}

/* eslint-enable security/detect-object-injection */
