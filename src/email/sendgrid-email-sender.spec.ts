import { SendgridEmailSender } from 'email/sendgrid-email-sender';
import { DummyConfig } from 'config';

describe('SendgridEmailSender', () => {
  let config: DummyConfig;
  let sendgridEmailSender: SendgridEmailSender;

  beforeEach(async () => {
    config = new DummyConfig();
    sendgridEmailSender = new SendgridEmailSender(config);
  });

  it('should be defined', () => {
    expect(sendgridEmailSender).toBeDefined();
  });
});
