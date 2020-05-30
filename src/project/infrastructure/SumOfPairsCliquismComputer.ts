import { Injectable } from '@nestjs/common';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { CliquismComputer } from 'project/domain/CliquismComputer';
import { Cliquism } from 'project/domain/review-topic/value-objects/Cliquism';

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function mean(arr: number[]): number {
  return sum(arr) / arr.length;
}

@Injectable()
export class SumOfPairsCliquismComputer extends CliquismComputer {
  protected computeForReviewTopic(peerReviews: PeerReviewCollection): Cliquism {
    // const _n = peerReviews.getNumberOfPeers();
    const cliquism = this.computeCliquism(peerReviews);
    return Cliquism.from(cliquism);
  }

  private computeCliquism(peerReviewCollection: PeerReviewCollection): number {
    const peerReviews = peerReviewCollection.toMap();
    const peers = peerReviewCollection.getPeers().map((roleId) => roleId.value);
    function Rijk(i: string, j: string, k: string): number {
      return peerReviews[i][j] / peerReviews[i][k];
    }
    function pairMean(j: string, k: string): number {
      return mean(
        peers.filter((i) => i !== j && i !== k).map((i) => Rijk(i, j, k)),
      );
    }
    function isPairCliquey(i: string, j: string): boolean {
      const iIn = sum(
        peers.filter((k) => k !== i && k !== j).map((k) => Rijk(i, j, k)),
      );
      const iOut = sum(
        peers.filter((k) => k !== i && k !== j).map((k) => pairMean(j, k)),
      );
      const jIn = sum(
        peers.filter((k) => k !== i && k !== j).map((k) => Rijk(j, i, k)),
      );
      const jOut = sum(
        peers.filter((k) => k !== i && k !== j).map((k) => pairMean(i, k)),
      );
      return iIn > iOut && jIn > jOut;
    }
    function pairCliquism(i: string, j: string): number {
      return mean(
        peers
          .filter((k) => k !== i && k !== j)
          .map((k) => Rijk(i, j, k) - pairMean(j, j)),
      );
    }
    return sum(
      peers.flatMap((i) =>
        peers
          .filter((j) => j !== i)
          .filter((j) => isPairCliquey(i, j))
          .map((j) => pairCliquism(i, j)),
      ),
    );
  }
}
