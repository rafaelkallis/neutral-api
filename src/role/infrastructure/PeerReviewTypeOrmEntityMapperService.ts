import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { PeerReviewModel } from 'role';
import { PeerReviewTypeOrmEntity } from 'role/infrastructure/PeerReviewTypeOrmEntity';

/**
 * PeerReview TypeOrm Entity Mapper
 */
@Injectable()
export class PeerReviewTypeOrmEntityMapperService
  implements
    TypeOrmEntityMapperService<PeerReviewModel, PeerReviewTypeOrmEntity> {
  /**
   *
   */
  public toModel(peerReviewEntity: PeerReviewTypeOrmEntity): PeerReviewModel {
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
  public toEntity(peerReviewModel: PeerReviewModel): PeerReviewTypeOrmEntity {
    return new PeerReviewTypeOrmEntity(
      peerReviewModel.id,
      peerReviewModel.createdAt,
      peerReviewModel.updatedAt,
      peerReviewModel.senderRoleId,
      peerReviewModel.receiverRoleId,
      peerReviewModel.score,
    );
  }
}
