import { EntityRepository } from 'typeorm';

import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { BaseRepository } from 'common/repositories/base.repository';

/**
 * Peer Review Repository
 */
@EntityRepository(PeerReviewEntity)
export class PeerReviewRepository extends BaseRepository<PeerReviewEntity> {
  /**
   *
   */
  public async existsBySenderRoleId(senderRoleId: string): Promise<boolean> {
    const count = await this.repository.count({ senderRoleId });
    return count > 0;
  }

  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return this.repository.find({ senderRoleId });
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return this.repository.find({ receiverRoleId });
  }
}
