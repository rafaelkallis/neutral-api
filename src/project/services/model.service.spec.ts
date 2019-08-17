import { Test, TestingModule } from '@nestjs/testing';

import { ModelService } from './model.service';

describe('ModelService', () => {
  let modelService: ModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelService],
    }).compile();

    modelService = module.get(ModelService);
  });

  test('should be defined', () => {
    expect(modelService).toBeDefined();
  });

  test('peerReviewsMapToVector', () => {
    const peerReviews = {
      b: 0.2,
      c: 0.3,
      a: 0.5,
    };
    const actualPeerReviewsVector = modelService.peerReviewsMapToVector(
      peerReviews,
    );
    expect(actualPeerReviewsVector).toEqual([0.5, 0.2, 0.3]);
  });

  test('compute relative contributions from matrix (>=4)', () => {
    const S = [
      [0, 20 / 90, 30 / 90, 40 / 90],
      [10 / 80, 0, 30 / 80, 40 / 80],
      [10 / 70, 20 / 70, 0, 40 / 70],
      [10 / 60, 20 / 60, 30 / 60, 0],
    ];
    const relCont = modelService.computeRelativeContributionsFromMatrix(S);
    expect(relCont[0]).toBeCloseTo(0.1);
    expect(relCont[1]).toBeCloseTo(0.2);
    expect(relCont[2]).toBeCloseTo(0.3);
    expect(relCont[3]).toBeCloseTo(0.4);
  });

  test('compute relative contributions from map (>=4)', () => {
    const M = {
      a: {
        a: 0,
        b: 20 / 90,
        c: 30 / 90,
        d: 40 / 90,
      },
      b: {
        a: 10 / 80,
        b: 0,
        c: 30 / 80,
        d: 40 / 80,
      },
      c: {
        a: 10 / 70,
        b: 20 / 70,
        c: 0,
        d: 40 / 70,
      },
      d: {
        a: 10 / 60,
        b: 20 / 60,
        c: 30 / 60,
        d: 0,
      },
    };
    const relCont = modelService.computeRelativeContributions(M);
    expect(relCont.a).toBeCloseTo(0.1);
    expect(relCont.b).toBeCloseTo(0.2);
    expect(relCont.c).toBeCloseTo(0.3);
    expect(relCont.d).toBeCloseTo(0.4);
  });
});
