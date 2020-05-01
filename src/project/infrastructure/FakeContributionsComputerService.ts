import { Injectable } from '@nestjs/common';
import {
  ContributionsComputer,
  Contributions,
} from 'project/domain/ContributionsComputer';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Id } from 'shared/domain/value-objects/Id';

@Injectable()
export class FakeContributionsComputerService extends ContributionsComputer {
  public compute(peerReviews: PeerReviewCollection): Contributions {
    const peers = Object.keys(peerReviews.toMap());
    const n = peers.length;
    return {
      of(_roleId: Id): ContributionAmount {
        return ContributionAmount.from(1 / n);
      },
    };
  }
}
