import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import {
  PeerReviewCollection,
  ReadonlyPeerReviewCollection,
} from 'project/domain/peer-review/PeerReviewCollection';
import { MeanDeviationConsensualityComputerService } from 'project/infrastructure/MeanDeviationConsensualityComputer';
import { VarianceConsensualityComputerService } from 'project/infrastructure/VarianceConsensualityComputer';
import { PairwiseRelativeJudgementsConsensualityComputerService } from 'project/infrastructure/PairwiseRelativeJudgementsConsensualityComputer';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';

describe('consensuality computer', () => {
  let consensualityComputer: ConsensualityComputer;

  let primitiveFaker: PrimitiveFaker;

  let a: string;
  let b: string;
  let c: string;
  let d: string;

  let cyclePeerReviews: ReadonlyPeerReviewCollection;
  let clusterPeerReviews: ReadonlyPeerReviewCollection;
  let oneDidItAllPeerReviews: ReadonlyPeerReviewCollection;

  const o = PeerReviewScore.EPSILON;
  const l = 1 - 3 * PeerReviewScore.EPSILON;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();

    a = primitiveFaker.id();
    b = primitiveFaker.id();
    c = primitiveFaker.id();
    d = primitiveFaker.id();

    cyclePeerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: l,
          [c]: o,
          [d]: o,
        },
        [b]: {
          [a]: o,
          [c]: l,
          [d]: o,
        },
        [c]: {
          [a]: o,
          [b]: o,
          [d]: l,
        },
        [d]: {
          [a]: l,
          [b]: o,
          [c]: o,
        },
      },
      ReviewTopicId.create(),
    );

    clusterPeerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: l,
          [c]: o,
          [d]: o,
        },
        [b]: {
          [a]: l,
          [c]: o,
          [d]: o,
        },
        [c]: {
          [a]: o,
          [b]: o,
          [d]: l,
        },
        [d]: {
          [a]: o,
          [b]: o,
          [c]: l,
        },
      },
      ReviewTopicId.create(),
    );

    oneDidItAllPeerReviews = PeerReviewCollection.fromMap(
      {
        [a]: {
          [b]: o,
          [c]: o,
          [d]: l,
        },
        [b]: {
          [a]: o,
          [c]: o,
          [d]: l,
        },
        [c]: {
          [a]: o,
          [b]: o,
          [d]: l,
        },
        [d]: {
          [a]: 1 / 3,
          [b]: 1 / 3,
          [c]: 1 / 3,
        },
      },
      ReviewTopicId.create(),
    );
  });

  describe('mean deviation method', () => {
    beforeEach(() => {
      consensualityComputer = new MeanDeviationConsensualityComputerService();
    });

    test('cycle', () => {
      const c = consensualityComputer.compute(cyclePeerReviews);
      expect(c.value).toBeCloseTo(0);
    });

    test('clusters', () => {
      const c = consensualityComputer.compute(clusterPeerReviews);
      expect(c.value).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const c = consensualityComputer.compute(oneDidItAllPeerReviews);
      expect(c.value).toBeCloseTo(3 / 4);
    });
  });

  describe('variance method', () => {
    beforeEach(() => {
      consensualityComputer = new VarianceConsensualityComputerService();
    });

    test('cycle', () => {
      const c = consensualityComputer.compute(cyclePeerReviews);
      expect(c.value).toBeCloseTo(0);
    });

    test('clusters', () => {
      const c = consensualityComputer.compute(clusterPeerReviews);
      expect(c.value).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const c = consensualityComputer.compute(oneDidItAllPeerReviews);
      expect(c.value).toBeCloseTo(0.91666);
    });
  });

  describe('pairwise relative judgements method', () => {
    beforeEach(() => {
      consensualityComputer = new PairwiseRelativeJudgementsConsensualityComputerService();
    });

    test('cycle', () => {
      const c = consensualityComputer.compute(cyclePeerReviews);
      expect(c.value).toBeCloseTo(0);
    });

    test('clusters', () => {
      const c = consensualityComputer.compute(clusterPeerReviews);
      expect(c.value).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const c = consensualityComputer.compute(oneDidItAllPeerReviews);
      expect(c.value).toBeCloseTo(1);
    });
  });
});
