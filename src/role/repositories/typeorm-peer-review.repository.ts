import { PeerReviewEntity } from 'role/entities/peer-review.entity';
import { TypeOrmRepository } from 'common';
import { PeerReviewRepository } from 'role/repositories/peer-review.repository';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { PeerReviewModel } from 'role/peer-review.model';
import { PeerReviewNotFoundException } from 'role/exceptions/peer-review-not-found.exception';

/**
 * Peer Review Repository
 */
@Injectable()
export class TypeOrmPeerReviewRepository
  extends TypeOrmRepository<PeerReviewModel, PeerReviewEntity>
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
  ): Promise<PeerReviewModel[]> {
    const peerReviewEntities = await this.internalRepository.find({
      senderRoleId,
    });
    const peerReviewModels = peerReviewEntities.map(e => this.toModel(e));
    return peerReviewModels;
  }

  /**
   *
   */
  public async findByReceiverRoleId(
    receiverRoleId: string,
  ): Promise<PeerReviewModel[]> {
    const peerReviewEntities = await this.internalRepository.find({
      receiverRoleId,
    });
    const peerReviewModels = peerReviewEntities.map(e => this.toModel(e));
    return peerReviewModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new PeerReviewNotFoundException();
  }

  /**
   *
   */
  protected toModel(peerReviewEntity: PeerReviewEntity): PeerReviewModel {
    return new PeerReviewModel(
      peerReviewEntity.id,
      peerReviewEntity.createdAt,
      peerReviewEntity.updatedAt,
      peerReviewEntity.senderRoleId,
      peerReviewEntity.receiverRoleId,
      peerReviewEntity.score,
    );
  }

  /**
   *
   */
  protected toEntity(peerReviewModel: PeerReviewModel): PeerReviewEntity {
    return new PeerReviewEntity(
      peerReviewModel.id,
      peerReviewModel.createdAt,
      peerReviewModel.updatedAt,
      peerReviewModel.senderRoleId,
      peerReviewModel.receiverRoleId,
      peerReviewModel.score,
    );
  }
}
