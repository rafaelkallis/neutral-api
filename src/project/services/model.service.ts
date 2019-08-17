import { Injectable } from '@nestjs/common';

/**
 * Model Service
 */
@Injectable()
export class ModelService {
  /**
   * Transforms peer reviews from the map to the vector form.
   * The entries are sorted by the role id in ascending order.
   */
  public peerReviewsMapToVector(peerReviews: Record<string, number>): number[] {
    const pairs: [string, number][] = Object.entries(peerReviews);
    pairs.sort(([roleId1], [roleId2]) => roleId1.localeCompare(roleId2));
    return pairs.map(([, score]) => score);
  }

  /**
   * Computes the relative contributions, given a matrix of peer review scores.
   *
   * @param {number[][]} S Matrix of peer review scores, where S[i][j] is i's score over j.
   * @return {number[]} The vector of relative contributions.
   */
  public computeRelativeContributions(S: number[][]): number[] {
    if (S.length < 4) {
      throw new Error('teams of < 4 not supported');
    }
    const S1 = this.computeS1(S);
    const S2 = this.computeS2(S1);
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
      return y * (1 / (n - 2));
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
