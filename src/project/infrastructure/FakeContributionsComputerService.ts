import { Injectable } from '@nestjs/common';
import {
  ContributionsComputer,
  Contributions,
} from 'project/domain/ContributionsComputer';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { Id } from 'shared/domain/value-objects/Id';

@Injectable()
export class FakeContributionsComputerService extends ContributionsComputer {
  public compute(peerReviews: PeerReviewCollection): Contributions {
    const peers = Object.keys(peerReviews.toMap());
    const n = peers.length;
    return {
      of(_roleId: Id) {
        return Contribution.from(1 / n);
      },
    };
  }
}
