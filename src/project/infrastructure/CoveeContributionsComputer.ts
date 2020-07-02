import { Injectable } from '@nestjs/common';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ContributionAmount } from 'project/domain/role/value-objects/ContributionAmount';
import { ReadonlyPeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { Contribution } from 'project/domain/contribution/Contribution';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

/**
 * Covee Contributions Computer
 */
@Injectable()
export class CoveeContributionsComputer extends ContributionsComputer {
  /**
   * Computes the relative contributions.
   */
  protected computeForReviewTopic(
    reviewTopic: ReviewTopicId,
    peerReviews: ReadonlyPeerReviewCollection,
  ): Contribution[] {
    const contributions: Contribution[] = [];
    const peers = peerReviews.getPeers();
    const S = peerReviews.toMatrix(reviewTopic);
    const relContVec: number[] = this.computeContributionsFromMatrix(S);
    for (const [i, iId] of peers.entries()) {
      const contributionAmount = ContributionAmount.from(relContVec[i]);
      const contribution = Contribution.from(
        iId,
        reviewTopic,
        contributionAmount,
      );
      contributions.push(contribution);
    }
    return contributions;

    // legacy implementation

    // const peerReviews = peerReviewCollection.toMap();
    // const ids: string[] = Object.keys(peerReviews).sort();
    // const S: number[][] = [];
    // for (const [i, iId] of ids.entries()) {
    //   if (ids.length - 1 !== Object.keys(peerReviews[iId]).length) {
    //     throw new InvariantViolationException();
    //   }
    //   S[i] = [];
    //   for (const [j, jId] of ids.entries()) {
    //     if (i === j) {
    //       S[i][j] = 0;
    //       continue;
    //     }
    //     if (iId === jId) {
    //       throw new InvariantViolationException();
    //     }
    //     if (peerReviews[iId][jId] === undefined) {
    //       throw new InvariantViolationException();
    //     }
    //     S[i][j] = peerReviews[iId][jId];
    //   }
    // }
    // const relContVec: number[] = this.computeContributionsFromMatrix(S);
    // const relContMap: Record<string, ContributionAmount> = {};
    // for (const [i, iId] of ids.entries()) {
    //   relContMap[iId] = ContributionAmount.from(relContVec[i]);
    // }
    // return {
    //   of(roleId: Id): ContributionAmount {
    //     const contribution = relContMap[roleId.value];
    //     if (!contribution) {
    //       throw new InternalServerErrorException();
    //     }
    //     return contribution;
    //   },
    // };
  }

  private computeContributionsFromMatrix(S: number[][]): number[] {
    if (S.length < 3) {
      throw new Error('teams of less than 3 not yet supported');
    }
    const S1 = this.computeS1(S);
    const S2 = this.computeS2(S1);

    if (S.length === 3) {
      const S4_3person = this.computeS4_3person(S2);
      const S5_3person = this.computeS5_3person(S4_3person);
      //const S5_3person = this.computeS5_3person_dvsn(S4_3person);
      return S5_3person;
    }

    const S3 = this.computeS3(S1);
    const S4 = this.computeS4(S2, S3);
    const S5 = this.computeS5(S4);
    return S5;
  }

  private computeS1(S: number[][]): number[][][] {
    const n = S.length;
    /* relative contribution ratio */
    function f(i: number, j: number, k: number): number {
      return S[i][j] / S[i][k];
    }
    const S1 = this.createNaNCube(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          S1[j][k][i] = f(i, j, k);
        }
      }
    }
    return S1;
  }

  private computeS2(S1: number[][][]): number[][] {
    const n = S1.length;
    /* average relative contribution ratios */
    function f(j: number, k: number): number {
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
        S2[j][k] = f(j, k);
      }
    }
    return S2;
  }

  private computeS3(S1: number[][][]): number[][][] {
    const n = S1.length;
    /* average relative contribution ratios without the input of agent i */
    function f(j: number, k: number, i: number): number {
      let y = 0;
      for (let ell = 0; ell < n; ell++) {
        if (ell !== i && ell !== j && ell !== k) {
          y += S1[j][k][ell];
        }
      }
      return y / (n - 3);
    }
    const S3 = this.createNaNCube(n);
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
          S3[j][k][i] = f(j, k, i);
        }
      }
    }
    return S3;
  }

  private computeS4(S2: number[][], S3: number[][][]): number[][] {
    const n = S2.length;
    /* auxiliary function */
    function f(i: number, j: number): number {
      let y = 1 + S2[j][i];
      for (let k = 0; k < n; k++) {
        if (k !== i && k !== j) {
          y += S3[k][i][j];
        }
      }
      return 1 / y;
    }
    const S4 = this.createNaNSquare(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        S4[i][j] = f(i, j);
      }
    }
    return S4;
  }

  private computeS5(S4: number[][]): number[] {
    const n = S4.length;
    /* relative contribution */
    function f(i: number): number {
      let y = 1;
      let z = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          y -= S4[j][i];
          z += S4[i][j];
        }
      }
      return (y + z) / n;
    }
    const S5 = this.createNanVector(n);
    for (let i = 0; i < n; i++) {
      S5[i] = f(i);
    }
    return S5;
  }

  private computeS4_3person(S2: number[][]): number[] {
    const n = S2.length;
    if (n !== 3) {
      throw new Error('only 3 person game allowed');
    }
    function h(i: number): number {
      let y = 1;
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          y += S2[k][i];
        }
      }
      return 1 / y;
    }
    const S4_3person = this.createNanVector(n);
    for (let i = 0; i < n; i++) {
      S4_3person[i] = h(i);
    }
    return S4_3person;
  }

  private computeS5_3person(S4_3person: number[]): number[] {
    const n = S4_3person.length;
    if (n !== 3) {
      throw new Error('only 3 person game allowed');
    }
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += S4_3person[i];
    }
    const S5_3person = this.createNanVector(n);
    for (let i = 0; i < n; i++) {
      S5_3person[i] = S4_3person[i] / sum;
    }
    return S5_3person;
  }

  /*
  private computeS5_3person_dvsn(S4_3person: number[]): number[] {
    const n = S4_3person.length;
    function f(i: number): number {
      let y = 1;
      let z = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          y -= S4_3person[j];
          z += S4_3person[i];
        }
      }
      return (y + z) / n;
    }
    const S5_3person_dvsn = this.createNanVector(n);
    for (let i = 0; i < n; i++) {
      S5_3person_dvsn[i] = f(i);
    }
    return S5_3person_dvsn;
  }
  */

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
}
