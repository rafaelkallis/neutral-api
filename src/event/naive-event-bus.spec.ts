import { NaiveEventBus } from 'event/naive-event-bus';

describe('NaiveEventBus', () => {
  let naiveEventBus: NaiveEventBus;

  beforeEach(() => {
    naiveEventBus = new NaiveEventBus();
  });

  it('should be defined', () => {
    expect(naiveEventBus).toBeDefined();
  });
});
