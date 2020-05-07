import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewDto } from './dto/PeerReviewDto';
import { Injectable, Type } from '@nestjs/common';

@Injectable()
export class PeerReviewDtoMap extends ObjectMap<PeerReview, PeerReviewDto> {
  protected doMap(peerReview: PeerReview): PeerReviewDto {
    return new PeerReviewDto(
      peerReview.id.value,
      peerReview.senderRoleId.value,
      peerReview.receiverRoleId.value,
      peerReview.reviewTopicId.value,
      peerReview.score.value,
      peerReview.createdAt.value,
      peerReview.updatedAt.value,
    );
  }

  public getSourceType(): Type<PeerReview> {
    return PeerReview;
  }

  public getTargetType(): Type<PeerReviewDto> {
    return PeerReviewDto;
  }
}
