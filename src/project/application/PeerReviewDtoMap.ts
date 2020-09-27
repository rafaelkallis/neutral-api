import { ObjectMap, ObjectMapContext } from 'shared/object-mapper/ObjectMap';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { Injectable } from '@nestjs/common';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';

@Injectable()
@ObjectMap.register(PeerReview, PeerReviewDto)
export class PeerReviewDtoMap extends ObjectMap<PeerReview, PeerReviewDto> {
  protected doMap(
    peerReview: PeerReview,
    context: ObjectMapContext,
  ): PeerReviewDto {
    const peerReviews = context.get('peerReviews', PeerReviewCollection);
    const rowsum = peerReviews
      .whereSenderRole(peerReview.senderRoleId)
      .whereReviewTopic(peerReview.reviewTopicId)
      .sumScores();
    return new PeerReviewDto(
      peerReview.id.value,
      peerReview.createdAt.value,
      peerReview.updatedAt.value,
      peerReview.senderRoleId.value,
      peerReview.receiverRoleId.value,
      peerReview.reviewTopicId.value,
      peerReview.score.value,
      peerReview.score.normalize(rowsum),
      peerReview.flag,
    );
  }
}
