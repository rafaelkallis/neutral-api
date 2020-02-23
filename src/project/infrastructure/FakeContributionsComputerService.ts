import { Injectable } from '@nestjs/common';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';

@Injectable()
export class FakeContributionsComputerService implements ContributionsComputer {
  public compute(
    peerReviews: PeerReviewCollection,
  ): Record<string, Contribution> {
    const peers = Object.keys(peerReviews.toMap());
    const n = peers.length;
    return peers.reduce(
      (contributions, peer) => ({
        ...contributions,
        [peer]: Contribution.from(1 / n),
      }),
      {},
    );
  }
}
