import { SendgridEmailSender } from 'email/sendgrid-email-sender';
import { MockConfig } from 'config';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { CONFIG } from 'config/constants';

describe('SendgridEmailSender', () => {
  let config: MockConfig;
  let sendgridEmailSender: SendgridEmailSender;

  beforeEach(async () => {
    config = new MockConfig();
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [SendgridEmailSender, { provide: CONFIG, useValue: config }],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    sendgridEmailSender = module.get(SendgridEmailSender);
  });

  it('should be defined', () => {
    expect(sendgridEmailSender).toBeDefined();
  });
});
