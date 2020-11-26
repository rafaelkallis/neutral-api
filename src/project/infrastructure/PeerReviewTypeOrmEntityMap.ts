import { ProjectTypeOrmEntity } from 'project/infrastructure/ProjectTypeOrmEntity';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { Injectable } from '@nestjs/common';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewTypeOrmEntity } from 'project/infrastructure/PeerReviewTypeOrmEntity';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import {
  stringToPeerReviewFlag,
  peerReviewFlagToString,
} from 'project/domain/peer-review/value-objects/PeerReviewFlag';
import { Project } from 'project/domain/project/Project';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';

@Injectable()
@ObjectMap.register(PeerReview, PeerReviewTypeOrmEntity)
export class PeerReviewTypeOrmEntityMap extends ObjectMap<
  PeerReview,
  PeerReviewTypeOrmEntity
> {
  protected doMap(
    peerReviewModel: PeerReview,
    ctx: ObjectMapContext,
  ): PeerReviewTypeOrmEntity {
    const project = ctx.get('project', ProjectTypeOrmEntity);
    return new PeerReviewTypeOrmEntity(
      peerReviewModel.id.value,
      peerReviewModel.createdAt.value,
      peerReviewModel.updatedAt.value,
      project,
      project.id,
      peerReviewModel.senderRoleId.value,
      peerReviewModel.receiverRoleId.value,
      peerReviewModel.reviewTopicId.value,
      peerReviewModel.milestone.id.value,
      peerReviewModel.score.value,
      peerReviewFlagToString(peerReviewModel.flag),
    );
  }
}

@Injectable()
@ObjectMap.register(PeerReviewTypeOrmEntity, PeerReview)
export class ReversePeerReviewTypeOrmEntityMap extends ObjectMap<
  PeerReviewTypeOrmEntity,
  PeerReview
> {
  protected doMap(
    peerReviewEntity: PeerReviewTypeOrmEntity,
    ctx: ObjectMapContext,
  ): PeerReview {
    const project = ctx.get('project', Project);
    return new PeerReview(
      PeerReviewId.from(peerReviewEntity.id),
      CreatedAt.from(peerReviewEntity.createdAt),
      UpdatedAt.from(peerReviewEntity.updatedAt),
      RoleId.from(peerReviewEntity.senderRoleId),
      RoleId.from(peerReviewEntity.receiverRoleId),
      ReviewTopicId.from(peerReviewEntity.reviewTopicId),
      MilestoneId.of(peerReviewEntity.milestoneId),
      PeerReviewScore.of(peerReviewEntity.score),
      stringToPeerReviewFlag(peerReviewEntity.flag),
      project,
    );
  }
}
