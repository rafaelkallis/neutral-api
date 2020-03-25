import { SendgridEmailService } from 'email/sendgrid-email.service';
import { MockConfig } from 'config/infrastructure/MockConfig';

describe.skip('SendgridEmailService', () => {
  let config: MockConfig;
  let sendgridEmail: SendgridEmailService;

  beforeEach(async () => {
    config = new MockConfig();
    sendgridEmail = new SendgridEmailService(config);
  });

  it('should be defined', () => {
    expect(sendgridEmail).toBeDefined();
  });
});
