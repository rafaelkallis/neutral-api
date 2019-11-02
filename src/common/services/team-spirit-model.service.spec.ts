import { Test, TestingModule } from '@nestjs/testing';

import { TeamSpiritModelService } from './team-spirit-model.service';

describe('TeamSpiritModelService', () => {
  let teamSpiritModelService: TeamSpiritModelService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TeamSpiritModelService],
    }).compile();

    teamSpiritModelService = module.get(TeamSpiritModelService);
  });

  test('should be defined', () => {
    expect(teamSpiritModelService).toBeDefined();
  });

  test('compute team spirit', () => {
    const peerReviews = {
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
    const teamSpirit = teamSpiritModelService.computeTeamSpirit(peerReviews);
    expect(teamSpirit).toBeGreaterThanOrEqual(0);
    expect(teamSpirit).toBeLessThanOrEqual(1);
  });

  test('nax team spirit', () => {
    const peerReviews = {
      a: {
        a: 0,
        b: 70 / 100,
        c: 10 / 100,
        d: 10 / 100,
        e: 10 / 100,
      },
      b: {
        a: 10 / 100,
        b: 0,
        c: 70 / 100,
        d: 10 / 100,
        e: 10 / 100,
      },
      c: {
        a: 70 / 100,
        b: 10 / 100,
        c: 0,
        d: 10 / 100,
        e: 10 / 100,
      },
      d: {
        a: 20 / 100,
        b: 20 / 100,
        c: 20 / 100,
        d: 0,
        e: 40 / 100,
      },
      e: {
        a: 20 / 100,
        b: 20 / 100,
        c: 20 / 100,
        d: 40 / 100,
        e: 0,
      },
    };
    const naxTeamSpirit = teamSpiritModelService.computeNaxTeamSpirit(
      peerReviews,
    );
    expect(naxTeamSpirit).toBeCloseTo(0.395326563);
  });
});
