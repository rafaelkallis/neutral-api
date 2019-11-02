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
    return 0;
  }
}

/* eslint-enable security/detect-object-injection */
