import { SendgridEmailSender } from 'email/sendgrid-email-sender';
import { MockConfig } from 'config';

describe('SendgridEmailSender', () => {
  let config: MockConfig;
  let sendgridEmailSender: SendgridEmailSender;

  beforeEach(async () => {
    config = new MockConfig();
    sendgridEmailSender = new SendgridEmailSender(config);
  });

  it('should be defined', () => {
    expect(sendgridEmailSender).toBeDefined();
  });
});
