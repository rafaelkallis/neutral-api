import { NaiveEventBusService } from 'shared/event/bus/infrastructure/NaiveEventBusService';

describe('NaiveEventBus', () => {
  let naiveEventBus: NaiveEventBusService;

  beforeEach(() => {
    naiveEventBus = new NaiveEventBusService();
  });

  it('should be defined', () => {
    expect(naiveEventBus).toBeDefined();
  });
});
