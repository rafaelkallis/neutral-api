import { Injectable } from '@nestjs/common';
import { TypeOrmEntityMapperService } from 'common/infrastructure/TypeOrmEntityMapperService';
import { PeerReviewModel } from 'role';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

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
      Id.from(peerReviewEntity.id),
      CreatedAt.from(peerReviewEntity.createdAt),
      UpdatedAt.from(peerReviewEntity.updatedAt),
      Id.from(peerReviewEntity.senderRoleId),
      Id.from(peerReviewEntity.receiverRoleId),
      peerReviewEntity.score,
    );
  }

  /**
   *
   */
  public toEntity(peerReviewModel: PeerReviewModel): PeerReviewTypeOrmEntity {
    return new PeerReviewTypeOrmEntity(
      peerReviewModel.id.value,
      peerReviewModel.createdAt.value,
      peerReviewModel.updatedAt.value,
      peerReviewModel.senderRoleId.value,
      peerReviewModel.receiverRoleId.value,
      peerReviewModel.score,
    );
  }
}
