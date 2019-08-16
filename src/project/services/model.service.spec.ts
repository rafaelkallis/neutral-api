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
});
