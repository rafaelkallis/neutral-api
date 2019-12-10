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

  const cyclePeerReviews = {
    a: { a: 0, b: 1, c: 0, d: 0 },
    b: { a: 0, b: 0, c: 1, d: 0 },
    c: { a: 0, b: 0, c: 0, d: 1 },
    d: { a: 1, b: 0, c: 0, d: 0 },
  };

  const clusterPeerReviews = {
    a: { a: 0, b: 1, c: 0, d: 0 },
    b: { a: 1, b: 0, c: 1, d: 0 },
    c: { a: 0, b: 0, c: 0, d: 1 },
    d: { a: 0, b: 0, c: 1, d: 0 },
  };

  const oneDidItAllPeerReviews = {
    a: { a: 0, b: 0, c: 0, d: 1 },
    b: { a: 0, b: 0, c: 0, d: 1 },
    c: { a: 0, b: 0, c: 0, d: 1 },
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
