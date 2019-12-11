import { Injectable } from '@nestjs/common';

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b);
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b) / arr.length;
}

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
   *  5) consensuality
   *
   *                    sum_j normCMD(j)
   *    consens := 1 - ------------------ , card(j) == n
   *                           n
   *
   */
  public meanDeviationMethod(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
    const peers = Object.keys(peerReviews);
    const n = peers.length;
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
    const nonConsenuality = mean(
      peers.map(j => columnMeanDeviation(j) / maxColumnMeanDeviation),
    );
    return 1 - nonConsenuality;
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
  public varianceMethod(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
    const peers = Object.keys(peerReviews);
    const n = peers.length;
    function variance(arr: number[]): number {
      const n = arr.length;
      const mean = sum(arr) / n;
      const squaredSum = sum(arr.map(x => Math.pow(x - mean, 2)));
      return squaredSum / n;
    }
    function worstColumn(n: number): number[] {
      const arr = new Array(n);
      arr.fill(0);
      arr[0] = 1;
      return arr;
    }
    function column(j: string): number[] {
      return peers.filter(i => i !== j).map(i => peerReviews[i][j]);
    }
    return (
      1 -
      mean(peers.map(j => variance(column(j)) / variance(worstColumn(n - 1))))
    );
  }

  public pairwiseRelativeJudgementsMethod(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
    const peers = Object.keys(peerReviews);
    const n = peers.length;
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
    return (
      1 -
      mean(
        peers.flatMap(i => peers.filter(j => j !== i).map(j => devRij(i, j))),
      )
    );
  }

  public isConsensual(consensuality: number): boolean {
    return consensuality >= ConsensualityModelService.CONSENSUALITY_THRESHOLD;
  }
}

/* eslint-enable security/detect-object-injection */
