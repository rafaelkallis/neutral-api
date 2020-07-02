import { Injectable } from '@nestjs/common';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

//function sum(arr: number[]): number {
//  return arr.reduce((a, b) => a + b);
//}

//function mean(arr: number[]): number {
//  var x = "[";
//  for (var j = 0; j < arr.length; j++) {
//    x += arr[j];
//    if (j < arr.length - 1) {
//        x += ", ";
//    }
//  }
//  console.log(x + "]");
//  return sum(arr) / arr.length;
//}

function printMatrix(s: string, arr: number[][]): void {
  var x = s + ': [\n';
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      x += arr[i][j].toFixed(2) + ', ';
    }
    x += '\n';
  }
  console.log(x + ']');
}

/**
 * Computes consensuality using pairwise relative judgements.
 */
@Injectable()
export class PairwiseRelativeJudgementsConsensualityComputer extends ConsensualityComputer {
  /**
   * Computes a project's consensuality.
   */
  protected computeForReviewTopic(
    peerReviews: PeerReviewCollection,
  ): Consensuality {
    const n = peerReviews.getNumberOfPeers();
    const maxDissent = this.computeDissent(this.createCyclicPeerReviews(n));
    const absoluteDissent = this.computeDissent(peerReviews);
    if (maxDissent === 0) {
      if (absoluteDissent !== 0) {
        throw new Error('invariant violation');
      }
      return Consensuality.from(1);
    }
    const normalizedDissent = absoluteDissent / maxDissent;
    const consensuality = 1 - normalizedDissent;
    //console.log('maxDissent       : ' + absoluteDissent);
    //console.log('absoluteDissent  : ' + maxDissent);
    //console.log('normalizedDissent: ' + normalizedDissent);
    //console.log('consensuality    : ' + consensuality);
    return Consensuality.from(consensuality);
  }

  private createNanVector(n: number): number[] {
    const m: number[] = [];
    for (let i = 0; i < n; i++) {
      m[i] = NaN;
    }
    return m;
  }

  private createNaNSquare(n: number): number[][] {
    const m: number[][] = [];
    for (let i = 0; i < n; i++) {
      m[i] = this.createNanVector(n);
    }
    return m;
  }

  private createNaNCube(n: number): number[][][] {
    const m: number[][][] = [];
    for (let i = 0; i < n; i++) {
      m[i] = this.createNaNSquare(n);
    }
    return m;
  }

  private computeDissent(peerReviewCollection: PeerReviewCollection): number {
    const D = peerReviewCollection.toMatrixArray();
    //for (var i=0; i<D.length; i++) {
    //    printMatrix("D", D[i]);
    //}
    var S = D[0];
    printMatrix('S', S);

    const n = S.length;
    function f1(i: number, j: number, k: number): number {
      return S[i][j] / S[i][k];
    }
    const S1 = this.createNaNCube(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          S1[j][k][i] = f1(i, j, k);
        }
      }
    }
    for (var i = 0; i < D.length; i++) {
      printMatrix('S1_' + i, S1[i]);
    }

    function f2(j: number, k: number): number {
      let y = 0;
      for (let i = 0; i < n; i++) {
        if (i !== j && i !== k) {
          y += S1[j][k][i];
        }
      }
      return y / (n - 2);
    }
    const S2 = this.createNaNSquare(n);
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        S2[j][k] = f2(j, k);
      }
    }
    printMatrix('S2', S2);

    function f3(j: number, k: number): number {
      let y = 0;
      for (let i = 0; i < n; i++) {
        if (i !== j && i !== k) {
          y += Math.pow(S1[j][k][i] - S2[j][k], 2);
        }
      }
      return y / (n - 2);
    }
    const S3 = this.createNaNSquare(n);
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        S3[j][k] = f3(j, k);
      }
    }
    printMatrix('S3', S3);

    var dissent = 0;
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (j < k) {
          dissent += S3[j][k];
        }
      }
    }
    console.log('dissent: ' + dissent);
    return dissent;
  }

  /*
  private computeDissent(peerReviewCollection: PeerReviewCollection): number {
    const A = peerReviewCollection.toMatrixArray();
    for (var i=0; i<A.length; i++) {
        printMatrix(A[i]);
    }
    const peerReviews = peerReviewCollection.toMap();
    const peers = Object.keys(peerReviews);
    function R_ijk(i: string, j: string, k: string): number {
      return peerReviews[i][j] / peerReviews[i][k];
    }
    function mu_jk(j: string, k: string): number {
      return mean(
        peers
            .filter((i) => i !== j && i !== k)
            .map((i) => R_ijk(i, j, k)),
      );
    }
    function sigma_sq_jk(j: string, k: string): number {
      return mean(
        peers
          .filter((i) => i !== j && i !== k)
          .map((i) => Math.pow(R_ijk(i, j, k) - mu_jk(j, k), 2)),
      );
    }
    const dissent = sum(
      peers.flatMap((j) =>
        peers.filter((k) => k !== j).map((k) => sigma_sq_jk(j, k)),
      ),
    );
    return dissent;
  }
*/

  private createCyclicPeerReviews(n: number): PeerReviewCollection {
    const reviewTopic = ReviewTopicId.create();
    const peerReviews = new PeerReviewCollection([]);
    const peers = [];
    for (let i = 0; i < n; i++) {
      peers.push(RoleId.create());
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i == j) {
          continue;
        }
        let score: number;
        if ((i + 1) % n == j) {
          score = 1;
        } else {
          score = 0;
        }
        const peerReview = PeerReview.from(
          peers[i],
          peers[j],
          reviewTopic,
          PeerReviewScore.from(score),
        );
        peerReviews.add(peerReview);
      }
    }
    return peerReviews;
  }
}
