import { Test } from '@nestjs/testing';

import { ConsensualityModelService } from './consensuality-model.service';

describe('ConsensualityModelService', () => {
  let consensualityModelService: ConsensualityModelService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ConsensualityModelService],
    }).compile();

    consensualityModelService = module.get(ConsensualityModelService);
  });

  const o = 0.00001;
  const l = 1 - 3 * o;

  const cyclePeerReviews = {
    a: { a: 0, b: l, c: o, d: o },
    b: { a: o, b: 0, c: l, d: o },
    c: { a: o, b: o, c: 0, d: l },
    d: { a: l, b: o, c: o, d: 0 },
  };

  const clusterPeerReviews = {
    a: { a: 0, b: l, c: o, d: o },
    b: { a: l, b: 0, c: o, d: o },
    c: { a: o, b: o, c: 0, d: l },
    d: { a: o, b: o, c: l, d: 0 },
  };

  const oneDidItAllPeerReviews = {
    a: { a: 0, b: o, c: o, d: l },
    b: { a: o, b: 0, c: o, d: l },
    c: { a: o, b: o, c: 0, d: l },
    d: { a: 1 / 3, b: 1 / 3, c: 1 / 3, d: 0 },
  };

  test('should use mean deviation method for computing consensuality', () => {
    jest.spyOn(consensualityModelService, 'meanDeviationMethod');
    const consensuality = consensualityModelService.computeConsensuality(
      cyclePeerReviews,
    );
    expect(consensuality).toBeGreaterThanOrEqual(0);
    expect(consensuality).toBeLessThanOrEqual(1);
    expect(consensualityModelService.meanDeviationMethod).toHaveBeenCalledWith(
      cyclePeerReviews,
    );
  });

  describe.skip('pairwise relative judgements method', () => {
    test('cycle', () => {
      const c = consensualityModelService.pairwiseRelativeJudgementsMethod(
        cyclePeerReviews,
      );
      expect(c).toBeCloseTo(0);
    });

    test('clusters', () => {
      const c = consensualityModelService.pairwiseRelativeJudgementsMethod(
        clusterPeerReviews,
      );
      expect(c).toBeCloseTo(0);
    });

    test.only('one did everything', () => {
      const c = consensualityModelService.pairwiseRelativeJudgementsMethod(
        oneDidItAllPeerReviews,
      );
      expect(c).toBeCloseTo(1);
    });
  });

  describe('mean deviation method', () => {
    test('cycle', () => {
      const c = consensualityModelService.meanDeviationMethod(cyclePeerReviews);
      expect(c).toBeCloseTo(0);
    });

    test('clusters', () => {
      const c = consensualityModelService.meanDeviationMethod(
        clusterPeerReviews,
      );
      expect(c).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const c = consensualityModelService.meanDeviationMethod(
        oneDidItAllPeerReviews,
      );
      expect(c).toBeCloseTo(3 / 4);
    });
  });

  describe('variance method', () => {
    test('cycle', () => {
      const c = consensualityModelService.varianceMethod(cyclePeerReviews);
      expect(c).toBeCloseTo(0);
    });

    test('clusters', () => {
      const c = consensualityModelService.varianceMethod(clusterPeerReviews);
      expect(c).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const c = consensualityModelService.varianceMethod(
        oneDidItAllPeerReviews,
      );
      expect(c).toBeCloseTo(0.91666);
    });
  });
});
