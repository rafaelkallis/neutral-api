import { ConsoleLoggerService } from 'logger/console-logger.service';

describe('LogService', () => {
  let logger: ConsoleLoggerService;

  beforeEach(() => {
    logger = new ConsoleLoggerService();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });
});
