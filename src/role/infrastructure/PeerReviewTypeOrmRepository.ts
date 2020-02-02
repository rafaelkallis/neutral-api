import { PeerReviewTypeOrmEntity } from 'role/infrastructure/PeerReviewTypeOrmEntity';
import { TypeOrmRepository } from 'common';
import { PeerReviewRepository } from 'role/domain/PeerReviewRepository';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { PeerReviewModel } from 'role/peer-review.model';
import { PeerReviewNotFoundException } from 'role/domain/exceptions/PeerReviewNotFoundException';
import { PeerReviewTypeOrmEntityMapperService } from 'role/infrastructure/PeerReviewTypeOrmEntityMapperService';

/**
 * Peer Review Repository
 */
@Injectable()
export class TypeOrmPeerReviewRepository
  extends TypeOrmRepository<PeerReviewModel, PeerReviewTypeOrmEntity>
  implements PeerReviewRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    peerReviewTypeOrmEntityMapper: PeerReviewTypeOrmEntityMapperService,
  ) {
    super(
      databaseClient,
      PeerReviewTypeOrmEntity,
      peerReviewTypeOrmEntityMapper,
    );
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
    const peerReviewModels = peerReviewEntities.map(e =>
      this.entityMapper.toModel(e),
    );
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
    const peerReviewModels = peerReviewEntities.map(e =>
      this.entityMapper.toModel(e),
    );
    return peerReviewModels;
  }

  /**
   *
   */
  protected throwEntityNotFoundException(): never {
    throw new PeerReviewNotFoundException();
  }
}
