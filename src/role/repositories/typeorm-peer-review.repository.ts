import { TypeOrmPeerReviewEntity } from 'role/entities/typeorm-peer-review.entity';
import { PeerReview } from 'role/role';
import { TypeOrmRepository } from 'common';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';
import { Injectable } from '@nestjs/common';
import { Database } from 'database';

/**
 * Peer Review Repository
 */
@Injectable()
export class TypeOrmPeerReviewRepository
  extends TypeOrmRepository<PeerReview, TypeOrmPeerReviewEntity>
  implements PeerReviewRepository {
  /**
   *
   */
  public constructor(database: Database) {
    super(database, TypeOrmPeerReviewEntity);
  }

  /**
   *
   */
  public createEntity(peerReview: PeerReview): TypeOrmPeerReviewEntity {
    const createdAt = Date.now();
    const updatedAt = Date.now();
    return new TypeOrmPeerReviewEntity(
      this,
      peerReview.id,
      createdAt,
      updatedAt,
      peerReview.senderRoleId,
      peerReview.receiverRoleId,
      peerReview.score,
    );
  }

  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: string,
  ): Promise<TypeOrmPeerReviewEntity[]> {
    return this.getInternalRepository().find({ senderRoleId });
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<TypeOrmPeerReviewEntity[]> {
    return this.getInternalRepository().find({ receiverRoleId });
  }
}
