import { RandomService } from './random.service';

describe('RandomService', () => {
  let service: RandomService;

  beforeEach(async () => {
    service = new RandomService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
