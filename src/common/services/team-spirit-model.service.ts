import { Injectable } from '@nestjs/common';
import { PeerReviews } from '../entities/role.entity';

/* eslint-disable security/detect-object-injection */

/**
 * TeamSpiritModel Service
 */
@Injectable()
export class TeamSpiritModelService {
  /**
   * Computes a project's team spirit.
   */
  public computeTeamSpirit(peerReviews: Record<string, PeerReviews>): number {
    return this.computeNaxTeamSpirit(peerReviews);
  }

  /**
   * Computes team spirit based on Heinrich Nax's
   * deviation from expectation.
   *
   * Result is normalized, 1 for best and 0 for worst
   * team spirit.
   */
  public computeNaxTeamSpirit(
    peerReviews: Record<string, PeerReviews>,
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
}

/* eslint-enable security/detect-object-injection */
