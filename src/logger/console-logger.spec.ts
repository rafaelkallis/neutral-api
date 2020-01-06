import { ConsoleLogger } from 'logger/console-logger';

describe('LogService', () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });
});
