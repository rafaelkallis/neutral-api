import td from 'testdouble';
import { SendgridEmailManager } from 'shared/email/manager/SendgridEmailManager';
import { Config } from 'shared/config/application/Config';

describe.skip('SendgridEmailManager', () => {
  let config: Config;
  let sendgridEmail: SendgridEmailManager;

  beforeEach(() => {
    config = td.object();
    sendgridEmail = new SendgridEmailManager(config);
  });

  it('should be defined', () => {
    expect(sendgridEmail).toBeDefined();
  });
});
