import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';

@Injectable()
export class StaticConsensualityComputer extends ConsensualityComputer {
  protected computeForReviewTopic(
    _peerReviews: PeerReviewCollection,
  ): Consensuality {
    return Consensuality.from(1);
  }
}
