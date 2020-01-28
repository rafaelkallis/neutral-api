import { NaiveEventBusService } from 'event/bus/naive-event-bus.service';

describe('NaiveEventBus', () => {
  let naiveEventBus: NaiveEventBusService;

  beforeEach(() => {
    naiveEventBus = new NaiveEventBusService();
  });

  it('should be defined', () => {
    expect(naiveEventBus).toBeDefined();
  });
});
