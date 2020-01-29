import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { TypeOrmRepository } from 'common';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';

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
  public constructor(databaseClient: DatabaseClientService) {
    super(databaseClient, PeerReviewEntity);
  }

  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return this.internalRepository.find({ senderRoleId });
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<PeerReviewEntity[]> {
    return this.internalRepository.find({ receiverRoleId });
  }
}
