import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { TypeOrmRepository } from 'common';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';
import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE } from 'database';

/**
 * Peer Review Repository
 */
@Injectable()
export class TypeOrmPeerReviewRepository
  extends TypeOrmRepository<PeerReviewEntity>
  implements PeerReviewRepository {
  /**
   *
   */
  public constructor(@Inject(DATABASE) database: Database) {
    super(database, PeerReviewEntity);
  }

  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return this.getInternalRepository().find({ senderRoleId });
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return this.getInternalRepository().find({ receiverRoleId });
  }
}
