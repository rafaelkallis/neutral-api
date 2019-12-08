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
    return this.computeNaxConsensuality(peerReviews);
  }

  /**
   * Computes consensuality based on Heinrich Nax's
   * deviation from expectation.
   *
   * Result is normalized, 1 for full consensus and 0 for no consensus.
   */
  public computeNaxConsensuality(
    peerReviews: Record<string, Record<string, number>>,
  ): number {
    const n = Object.keys(peerReviews).length;
    /* only holds if equal contribution is expected from all */
    const maxDeviation = (2 * n * (n - 2)) / (n - 1);
    let deviation = 0;
    for (const i of Object.keys(peerReviews)) {
      for (const j of Object.keys(peerReviews[i])) {
        if (i !== j) {
          /* assume equal contribution from all */
          const expected = 1 / (n - 1);
          const actual = peerReviews[i][j];
          deviation += Math.abs(expected - actual);
        }
      }
    }
    return 1 - deviation / maxDeviation;
  }

  public isConsensual(consensuality: number): boolean {
    return consensuality >= ConsensualityModelService.CONSENSUALITY_THRESHOLD;
  }
}

/* eslint-enable security/detect-object-injection */
