import td from 'testdouble';
import { MagicLinkFactory } from './MagicLinkFactory';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Config } from 'shared/config/application/Config';
import { Email } from 'user/domain/value-objects/Email';

describe(MagicLinkFactory.name, () => {
  let scenario: UnitTestScenario<MagicLinkFactory>;
  let magicLinkFactory: MagicLinkFactory;
  let config: Config;
  let loginToken: string;
  let email: Email;
  let frontendUrl: string;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(MagicLinkFactory)
      .addProviderMock(Config)
      .build();
    magicLinkFactory = scenario.subject;
    config = scenario.module.get(Config);
    loginToken = scenario.primitiveFaker.id();
    email = scenario.valueObjectFaker.user.email();
    frontendUrl = scenario.primitiveFaker.url();
    td.when(config.get('FRONTEND_URL')).thenReturn(frontendUrl);
  });

  test('should create signup link', () => {
    const signupLink = magicLinkFactory.createLoginLink({
      loginToken,
      email,
      isNew: true,
    });
    expect(signupLink).toEqual(
      `${frontendUrl}/login/callback?token=${loginToken}&email=${email.value}&new=true`,
    );
  });
});
