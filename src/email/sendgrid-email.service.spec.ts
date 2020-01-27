import { MockConfig } from 'config';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { CONFIG } from 'config/constants';
import { SendgridEmailService } from 'email/sendgrid-email.service';

describe.skip('SendgridEmailService', () => {
  let config: MockConfig;
  let sendgridEmail: SendgridEmailService;

  beforeEach(async () => {
    config = new MockConfig();
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [SendgridEmailService, { provide: CONFIG, useValue: config }],
    }).compile();
    const app = module.createNestApplication();
    await app.init();
    sendgridEmail = module.get(SendgridEmailService);
  });

  it('should be defined', () => {
    expect(sendgridEmail).toBeDefined();
  });
});
