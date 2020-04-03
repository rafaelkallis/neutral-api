import { SendgridEmailManager } from 'shared/email/SendgridEmailManager';
import { MockConfig } from 'shared/config/infrastructure/MockConfig';

describe.skip('SendgridEmailManager', () => {
  let config: MockConfig;
  let sendgridEmail: SendgridEmailManager;

  beforeEach(async () => {
    config = new MockConfig();
    sendgridEmail = new SendgridEmailManager(config);
  });

  it('should be defined', () => {
    expect(sendgridEmail).toBeDefined();
  });
});
