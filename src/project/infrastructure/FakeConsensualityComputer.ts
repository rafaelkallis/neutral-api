import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

@Injectable()
export class FakeConsensualityComputerService implements ConsensualityComputer {
  public compute(_peerReviews: PeerReviewCollection): Consensuality {
    return Consensuality.from(0.5);
  }
}
