import { Test, TestingModule } from '@nestjs/testing';

import { ContributionsModelService } from './contributions-model.service';

describe('ContributionsModelService', () => {
  let contributionsModelService: ContributionsModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContributionsModelService],
    }).compile();

    contributionsModelService = module.get(ContributionsModelService);
  });

  test('should be defined', () => {
    expect(contributionsModelService).toBeDefined();
  });

  test('compute contributions from matrix (>=4)', () => {
    const S = [
      [0, 20 / 90, 30 / 90, 40 / 90],
      [10 / 80, 0, 30 / 80, 40 / 80],
      [10 / 70, 20 / 70, 0, 40 / 70],
      [10 / 60, 20 / 60, 30 / 60, 0],
    ];
    const relCont = contributionsModelService.computeContributionsFromMatrix(S);
    expect(relCont[0]).toBeCloseTo(0.1);
    expect(relCont[1]).toBeCloseTo(0.2);
    expect(relCont[2]).toBeCloseTo(0.3);
    expect(relCont[3]).toBeCloseTo(0.4);
  });

  test('compute contributions from map (>=4)', () => {
    const M = {
      a: {
        b: 20 / 90,
        c: 30 / 90,
        d: 40 / 90,
      },
      b: {
        a: 10 / 80,
        c: 30 / 80,
        d: 40 / 80,
      },
      c: {
        a: 10 / 70,
        b: 20 / 70,
        d: 40 / 70,
      },
      d: {
        a: 10 / 60,
        b: 20 / 60,
        c: 30 / 60,
      },
    };
    const relCont = contributionsModelService.computeContributions(M);
    expect(relCont.a).toBeCloseTo(0.1);
    expect(relCont.b).toBeCloseTo(0.2);
    expect(relCont.c).toBeCloseTo(0.3);
    expect(relCont.d).toBeCloseTo(0.4);
  });
});
