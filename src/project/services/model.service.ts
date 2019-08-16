import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

/**
 * Model Service
 */
@Injectable()
export class ModelService {
  /**
   * Transforms peer reviews from the map to the vector form.
   * The entries are sorted by the role id in ascending order.
   */
  public peerReviewsMapToVector(peerReviews: Record<string, number>): number[] {
    const pairs: [string, number][] = Object.entries(peerReviews);
    pairs.sort(([roleId1], [roleId2]) => roleId1.localeCompare(roleId2));
    return pairs.map(([, score]) => score);
  }
}
