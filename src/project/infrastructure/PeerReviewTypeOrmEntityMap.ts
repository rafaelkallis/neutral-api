import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable, Type } from '@nestjs/common';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

@Injectable()
export class PeerReviewTypeOrmEntityMap extends ObjectMap<
  PeerReview,
  PeerReviewTypeOrmEntity
> {
  protected doMap(
    peerReviewModel: PeerReview,
    ctx: ObjectMapContext,
  ): PeerReviewTypeOrmEntity {
    return new PeerReviewTypeOrmEntity(
      peerReviewModel.id.value,
      peerReviewModel.createdAt.value,
      peerReviewModel.updatedAt.value,
      ctx.get('project', ProjectTypeOrmEntity),
      peerReviewModel.senderRoleId.value,
      peerReviewModel.receiverRoleId.value,
      peerReviewModel.reviewTopicId.value,
      peerReviewModel.score.value,
    );
  }

  public getSourceType(): Type<PeerReview> {
    return PeerReview;
  }

  public getTargetType(): Type<PeerReviewTypeOrmEntity> {
    return PeerReviewTypeOrmEntity;
  }
}

@Injectable()
export class ReversePeerReviewTypeOrmEntityMap extends ObjectMap<
  PeerReviewTypeOrmEntity,
  PeerReview
> {
  protected doMap(
    peerReviewEntity: PeerReviewTypeOrmEntity,
    context: ObjectMapContext,
  ): PeerReview {
    return new PeerReview(
      context.get('unitOfWork', UnitOfWork),
      PeerReviewId.from(peerReviewEntity.id),
      CreatedAt.from(peerReviewEntity.createdAt),
      UpdatedAt.from(peerReviewEntity.updatedAt),
      RoleId.from(peerReviewEntity.senderRoleId),
      RoleId.from(peerReviewEntity.receiverRoleId),
      ReviewTopicId.from(peerReviewEntity.reviewTopicId),
      PeerReviewScore.from(peerReviewEntity.score),
    );
  }

  public getSourceType(): Type<PeerReviewTypeOrmEntity> {
    return PeerReviewTypeOrmEntity;
  }

  public getTargetType(): Type<PeerReview> {
    return PeerReview;
  }
}
