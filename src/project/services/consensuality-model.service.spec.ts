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

  test('should use mean deviation method for computing consensuality', () => {
    jest.spyOn(consensualityModelService, 'meanDeviationMethod');
    const peerReviews = {
      a: {
        a: 0,
        b: 1,
        c: 0,
        d: 0,
      },
      b: {
        a: 0,
        b: 0,
        c: 1,
        d: 0,
      },
      c: {
        a: 0,
        b: 0,
        c: 0,
        d: 1,
      },
      d: {
        a: 1,
        b: 0,
        c: 0,
        d: 0,
      },
    };
    const consensuality = consensualityModelService.computeConsensuality(
      peerReviews,
    );
    expect(consensuality).toBeGreaterThanOrEqual(0);
    expect(consensuality).toBeLessThanOrEqual(1);
    expect(consensualityModelService.meanDeviationMethod).toHaveBeenCalledWith(
      peerReviews,
    );
  });

  describe('mean deviation method', () => {
    test('cycle', () => {
      const peerReviews = {
        a: {
          a: 0,
          b: 1,
          c: 0,
          d: 0,
        },
        b: {
          a: 0,
          b: 0,
          c: 1,
          d: 0,
        },
        c: {
          a: 0,
          b: 0,
          c: 0,
          d: 1,
        },
        d: {
          a: 1,
          b: 0,
          c: 0,
          d: 0,
        },
      };
      const c = consensualityModelService.meanDeviationMethod(peerReviews);
      expect(c).toBeCloseTo(0);
    });

    test('clusters', () => {
      const peerReviews = {
        a: {
          a: 0,
          b: 1,
          c: 0,
          d: 0,
        },
        b: {
          a: 1,
          b: 0,
          c: 0,
          d: 0,
        },
        c: {
          a: 0,
          b: 0,
          c: 0,
          d: 1,
        },
        d: {
          a: 0,
          b: 0,
          c: 1,
          d: 0,
        },
      };
      const c = consensualityModelService.meanDeviationMethod(peerReviews);
      expect(c).toBeCloseTo(0);
    });

    test('one did everything', () => {
      const peerReviews = {
        a: {
          a: 0,
          b: 0,
          c: 0,
          d: 1,
        },
        b: {
          a: 0,
          b: 0,
          c: 0,
          d: 1,
        },
        c: {
          a: 0,
          b: 0,
          c: 0,
          d: 1,
        },
        d: {
          a: 1 / 3,
          b: 1 / 3,
          c: 1 / 3,
          d: 0,
        },
      };
      const c = consensualityModelService.meanDeviationMethod(peerReviews);
      expect(c).toBeCloseTo(3 / 4);
    });
  });
});
