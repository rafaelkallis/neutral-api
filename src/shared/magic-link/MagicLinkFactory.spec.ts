import td from 'testdouble';
import { MagicLinkFactory } from './MagicLinkFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Config } from 'shared/config/application/Config';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Email } from 'user/domain/value-objects/Email';

describe(MagicLinkFactory.name, () => {
  let scenario: UnitTestScenario<MagicLinkFactory>;
  let magicLinkFactory: MagicLinkFactory;
  let config: Config;
  let tokenManager: TokenManager;
  let email: Email;
  let frontendUrl: string;
  let signupToken: string;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(MagicLinkFactory)
      .addProviderMock(Config)
      .addProviderMock(TokenManager)
      .build();
    magicLinkFactory = scenario.subject;
    config = scenario.module.get(Config);
    tokenManager = scenario.module.get(TokenManager);
    email = scenario.valueObjectFaker.user.email();
    frontendUrl = Math.random().toString();
    td.when(config.get('FRONTEND_URL')).thenReturn(frontendUrl);
    signupToken = Math.random().toString();
    td.when(tokenManager.newSignupToken(email.value)).thenReturn(signupToken);
  });

  test('should create signup link', () => {
    const signupLink = magicLinkFactory.createSignupLink(email);
    expect(signupLink).toEqual(expect.any(String));
  });
});
