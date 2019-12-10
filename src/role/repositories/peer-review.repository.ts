import { EntityRepository } from 'typeorm';

import { PeerReviewEntity } from '../entities/peer-review.entity';

import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Peer Review Repository
 */
@EntityRepository(PeerReviewEntity)
export class PeerReviewRepository extends BaseRepository<PeerReviewEntity> {}
