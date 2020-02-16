import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { PeerReviewRepository } from 'role/domain/PeerReviewRepository';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'database';
import { PeerReviewModel } from 'role/domain/PeerReviewModel';
import { PeerReviewNotFoundException } from 'project/domain/exceptions/PeerReviewNotFoundException';
import { PeerReviewTypeOrmEntityMapperService } from 'role/infrastructure/PeerReviewTypeOrmEntityMapperService';
import { SimpleTypeOrmRepository } from 'common/infrastructure/SimpleTypeOrmRepository';
import { ObjectType } from 'typeorm';
import { Id } from 'common/domain/value-objects/Id';

/**
 * Peer Review Repository
 */
@Injectable()
export class TypeOrmPeerReviewRepository
  extends SimpleTypeOrmRepository<PeerReviewModel, PeerReviewTypeOrmEntity>
  implements PeerReviewRepository {
  /**
   *
   */
  public constructor(
    databaseClient: DatabaseClientService,
    peerReviewTypeOrmEntityMapper: PeerReviewTypeOrmEntityMapperService,
  ) {
    super(databaseClient, peerReviewTypeOrmEntityMapper);
  }

  /**
   *
   */
  public async findBySenderRoleId(
    senderRoleId: Id,
  ): Promise<PeerReviewModel[]> {
    const peerReviewEntities = await this.entityManager
      .getRepository(PeerReviewTypeOrmEntity)
      .find({
        senderRoleId: senderRoleId.value,
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
    receiverRoleId: Id,
  ): Promise<PeerReviewModel[]> {
    const peerReviewEntities = await this.entityManager
      .getRepository(PeerReviewTypeOrmEntity)
      .find({
        receiverRoleId: receiverRoleId.value,
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

  /**
   *
   */
  protected getEntityType(): ObjectType<PeerReviewTypeOrmEntity> {
    return PeerReviewTypeOrmEntity;
  }
}
