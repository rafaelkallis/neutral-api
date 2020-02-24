import { SendgridEmailService } from 'email/sendgrid-email.service';
import { MockConfigService } from 'config/infrastructure/MockConfigService';

describe.skip('SendgridEmailService', () => {
  let config: MockConfigService;
  let sendgridEmail: SendgridEmailService;

  beforeEach(async () => {
    config = new MockConfigService();
    sendgridEmail = new SendgridEmailService(config);
  });

  it('should be defined', () => {
    expect(sendgridEmail).toBeDefined();
  });
});
